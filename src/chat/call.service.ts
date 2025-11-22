import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus, CallType } from './entities/call.entity';
import { CreateCallDto, CallRejectDto, CallEndDto, IceCandidateDto } from './dto/call.dto';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
  ) {}

  /**
   * Inisiasi panggilan (caller membuat offer)
   */
  async initiateCall(callerId: number, dto: CreateCallDto): Promise<Call> {
    // Cek apakah sudah ada panggilan aktif
    const activeCall = await this.callRepository.findOne({
      where: [
        {
          callerId: callerId,
          status: CallStatus.ACTIVE,
        },
        {
          receiverId: callerId,
          status: CallStatus.ACTIVE,
        },
      ],
    });

    if (activeCall) {
      throw new Error('You already have an active call');
    }

    const call = this.callRepository.create({
      callerId,
      receiverId: dto.receiverId,
      conversationId: dto.conversationId,
      callType: dto.callType,
      status: CallStatus.INITIATED,
      ringingStartedAt: new Date(),
    });

    return this.callRepository.save(call);
  }

  /**
   * Receiver menolak panggilan
   */
  async rejectCall(receiverId: number, callId: number, reason?: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.receiverId !== receiverId) {
      throw new ForbiddenException('Only receiver can reject call');
    }

    call.status = CallStatus.REJECTED;
    call.rejectionReason = reason || 'User declined';
    call.endedAt = new Date();

    return this.callRepository.save(call);
  }

  /**
   * Receiver menerima panggilan dan mengirim answer
   */
  async acceptCall(
    receiverId: number,
    callId: number,
    answer: string,
  ): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.receiverId !== receiverId) {
      throw new ForbiddenException('Only receiver can accept call');
    }

    call.status = CallStatus.ACCEPTED;
    call.receiverAnswer = answer;
    call.acceptedAt = new Date();

    return this.callRepository.save(call);
  }

  /**
   * Simpan SDP offer dari caller
   */
  async saveCallerOffer(callerId: number, callId: number, offer: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.callerId !== callerId) {
      throw new ForbiddenException('Only caller can save offer');
    }

    call.callerOffer = offer;
    call.status = CallStatus.RINGING;

    return this.callRepository.save(call);
  }

  /**
   * Tambah ICE candidate
   */
  async addIceCandidate(userId: number, dto: IceCandidateDto): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: dto.callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Verifikasi user adalah bagian dari call
    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new ForbiddenException('User not part of this call');
    }

    if (!call.iceCandidates) {
      call.iceCandidates = [];
    }

    call.iceCandidates.push(dto.candidate);
    return this.callRepository.save(call);
  }

  /**
   * End panggilan
   */
  async endCall(userId: number, callId: number, duration?: number): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.callerId !== userId && call.receiverId !== userId) {
      throw new ForbiddenException('User not part of this call');
    }

    call.status = CallStatus.ENDED;
    call.endedAt = new Date();

    if (duration) {
      call.duration = duration;
    } else if (call.acceptedAt) {
      // Hitung durasi dari acceptedAt sampai sekarang
      call.duration = Math.floor(
        (new Date().getTime() - call.acceptedAt.getTime()) / 1000,
      );
    }

    return this.callRepository.save(call);
  }

  /**
   * Get call details
   */
  async getCall(callId: number): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
      relations: ['caller', 'receiver'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    return call;
  }

  /**
   * Get missed calls untuk user
   */
  async getMissedCalls(userId: number): Promise<Call[]> {
    // Missed call = caller attempted call tapi receiver tidak accept/reject dalam waktu tertentu
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const missedCalls = await this.callRepository.find({
      where: {
        receiverId: userId,
        status: CallStatus.INITIATED,
        ringingStartedAt: {
          $lt: twoMinutesAgo,
        } as any,
      },
      relations: ['caller'],
    });

    return missedCalls;
  }

  /**
   * Get call history antara dua user
   */
  async getCallHistory(
    userId: number,
    otherUserId: number,
    limit: number = 50,
  ): Promise<Call[]> {
    const calls = await this.callRepository.find({
      where: [
        {
          callerId: userId,
          receiverId: otherUserId,
        },
        {
          callerId: otherUserId,
          receiverId: userId,
        },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return calls;
  }

  /**
   * Get call statistics untuk user
   */
  async getCallStats(userId: number) {
    const completedCalls = await this.callRepository.find({
      where: [
        {
          callerId: userId,
          status: CallStatus.ENDED,
        },
        {
          receiverId: userId,
          status: CallStatus.ENDED,
        },
      ],
    });

    const totalDuration = completedCalls.reduce(
      (sum, call) => sum + (call.duration || 0),
      0,
    );

    const missedCalls = await this.callRepository.count({
      where: {
        receiverId: userId,
        status: CallStatus.REJECTED,
      },
    });

    return {
      totalCalls: completedCalls.length,
      totalDuration,
      averageDuration:
        completedCalls.length > 0 ? totalDuration / completedCalls.length : 0,
      missedCalls,
    };
  }

  /**
   * Mark call as missed (jika tidak dijawab)
   */
  async markAsMissed(callId: number): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    call.status = CallStatus.MISSED;
    call.endedAt = new Date();

    return this.callRepository.save(call);
  }

  /**
   * Clean up old calls (panggilannya gagal/belum dijawab)
   */
  async cleanupStaleRingingCalls(): Promise<void> {
    // Ambil calls yang ringing lebih dari 2 menit
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const staleCalls = await this.callRepository.find({
      where: {
        status: CallStatus.INITIATED,
        ringingStartedAt: {
          $lt: twoMinutesAgo,
        } as any,
      },
    });

    if (staleCalls.length > 0) {
      staleCalls.forEach((call) => {
        call.status = CallStatus.MISSED;
        call.endedAt = new Date();
      });

      await this.callRepository.save(staleCalls);
    }
  }
}
