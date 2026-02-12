import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

/**
 * WalasApiClient
 * Service untuk komunikasi dengan Walas API
 * Mengkonsumsi endpoints dari Walas untuk mendapatkan data siswa, presensi, catatan kasus, dll
 */
@Injectable()
export class WalasApiClient {
  private walasUrl: string;
  private apiToken: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.walasUrl = this.configService.get<string>('WALAS_API_URL', 'http://localhost:8000');
    this.apiToken = this.configService.get<string>('WALAS_API_TOKEN', '');
  }

  /**
   * Helper method: Build headers with JWT token
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'X-System': 'ruang-siswa-kesiswaan',
    };
  }

  /**
   * Helper method: Build full API URL
   */
  private buildUrl(endpoint: string): string {
    return `${this.walasUrl}${endpoint}`;
  }

  /**
   * Helper method: Error handling
   */
  private handleError(error: AxiosError, method: string) {
    console.error(`${method} error:`, error.response?.data || error.message);
    throw new Error(
      `Failed to call Walas API: ${error.response?.statusText || error.message}`
    );
  }

  // ========== SECTION A: PEMBINAAN SYNC APIs ==========
  // Centralized methods for syncing Pembinaan (coaching/discipline tracking) data from WALASU

  /**
   * Get violation/pelanggaran list from WALASU
   * Fetches catatan_kasus_siswas data with optional filters
   * GET /api/v1/walas/pelanggaran?student_id=X&class_id=Y&start_date=2025-01-01&end_date=2025-01-31&page=1&limit=50
   */
  async getPelanggaranList(filters?: {
    student_id?: number;
    class_id?: number;
    walas_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.student_id) params.append('student_id', filters.student_id.toString());
      if (filters?.class_id) params.append('class_id', filters.class_id.toString());
      if (filters?.walas_id) params.append('walas_id', filters.walas_id.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.page) params.append('page', (filters.page || 1).toString());
      if (filters?.limit) params.append('limit', (filters.limit || 50).toString());

      const url = this.buildUrl(
        `/api/v1/walas/pelanggaran${params.toString() ? '?' + params.toString() : ''}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getPelanggaranList');
    }
  }

  /**
   * Sync pembinaan data from WALASU to RuangSiswa Backend
   * Receives violation data and forwards to Pembinaan sync endpoint
   * POST /api/v1/walas/pelanggaran/sync (forward from WALASU)
   * Then processes via PembinaanService.syncFromWalas()
   */
  async syncPembinaanFromWalas(payload: {
    walas_id: number;
    walas_name?: string;
    siswas_id: number;
    siswas_name?: string;
    kasus: string; // violation description
    tindak_lanjut?: string; // follow-up actions
    keterangan?: string; // notes
    tanggal_pembinaan: string; // ISO date format
    class_id?: number;
    class_name?: string;
  }) {
    try {
      const url = this.buildUrl('/api/v1/walas/pelanggaran/sync');
      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'syncPembinaanFromWalas');
    }
  }

  /**
   * Fetch violation statistics from WALASU
   * Useful for dashboard and monitoring
   * GET /api/v1/walas/pelanggaran/stats?class_id=1&start_date=2025-01-01&end_date=2025-02-06
   */
  async getPelanggaranStats(filters?: {
    class_id?: number;
    walas_id?: number;
    start_date?: string;
    end_date?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.class_id) params.append('class_id', filters.class_id.toString());
      if (filters?.walas_id) params.append('walas_id', filters.walas_id.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const url = this.buildUrl(
        `/api/v1/walas/pelanggaran/stats${params.toString() ? '?' + params.toString() : ''}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getPelanggaranStats');
    }
  }

  /**
   * Get single violation detail by ID
   * GET /api/v1/walas/pelanggaran/{id}
   */
  async getPelanggaranDetail(pelanggaranId: number) {
    try {
      const url = this.buildUrl(`/api/v1/walas/pelanggaran/${pelanggaranId}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getPelanggaranDetail');
    }
  }

  /**
   * Get violations for specific student
   * GET /api/v1/walas/pelanggaran/student/{studentId}?limit=50
   */
  async getPelanggaranByStudent(studentId: number, limit: number = 50) {
    try {
      const url = this.buildUrl(`/api/v1/walas/pelanggaran/student/${studentId}?limit=${limit}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getPelanggaranByStudent');
    }
  }

  /**
   * Get violations by Walas/teacher
   * GET /api/v1/walas/pelanggaran/walas/{walasId}?page=1&limit=50
   */
  async getPelanggaranByWalas(walasId: number, page: number = 1, limit: number = 50) {
    try {
      const url = this.buildUrl(
        `/api/v1/walas/pelanggaran/walas/${walasId}?page=${page}&limit=${limit}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getPelanggaranByWalas');
    }
  }

  /**
   * Get student biodata with parent information
   * GET /api/v1/walas/students/{studentId}
   * Or fallback to direct /get-siswa/{id} endpoint
   */
  async getStudentBiodata(studentId: number) {
    try {
      // Try API v1 endpoint first
      let url = this.buildUrl(`/api/v1/walas/students/${studentId}`);
      let response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders(), validateStatus: () => true })
      );

      // If v1 endpoint not found, try fallback endpoint
      if (response.status === 404) {
        console.warn(`API v1 students endpoint not found, trying fallback /get-siswa endpoint`);
        url = this.buildUrl(`/get-siswa/${studentId}`);
        response = await firstValueFrom(
          this.httpService.get(url, { headers: this.getHeaders() })
        );
      }

      return response.data?.data || response.data;
    } catch (error) {
      console.warn(`Could not fetch student biodata for ${studentId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get parent data (from biodata) for a student
   * As fallback if parent_data not included in pelanggaran response
   * Sends request directly to Walas API to fetch siswa with biodata
   * Tries multiple sources: student endpoint, pelanggaran list, get-siswa endpoint
   */
  async getStudentParentData(studentId: number) {
    try {
      // Try to get from student endpoint first
      let student = await this.getStudentBiodata(studentId);
      if (student?.biodata) {
        console.log(`✅ Found biodata from student endpoint for student ${studentId}`);
        return student.biodata;
      }
      if (student?.nama_ayah || student?.nama_ibu) {
        console.log(`✅ Found parent data directly in student for student ${studentId}`);
        return student; // biodata columns directly in siswa record
      }

      // Fallback: try to fetch from pelanggaran list for this student
      console.warn(`Biodata not found in student endpoint, trying pelanggaran list...`);
      const pelanggaranList = await this.getPelanggaranByStudent(studentId, 1);
      if (Array.isArray(pelanggaranList) && pelanggaranList.length > 0) {
        const pelanggaran = pelanggaranList[0];
        if (pelanggaran?.parent_data) {
          console.log(`✅ Found parent_data in pelanggaran for student ${studentId}`);
          return pelanggaran.parent_data;
        }
        if (pelanggaran?.siswa?.biodata) {
          console.log(`✅ Found biodata in pelanggaran.siswa for student ${studentId}`);
          return pelanggaran.siswa.biodata;
        }
      }

      console.warn(`No parent data found for student ${studentId}`);
      return null;
    } catch (error) {
      console.warn(`Error fetching parent data for student ${studentId}: ${error.message}`);
      return null;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const url = this.buildUrl('/api/v1/walas/students');
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          timeout: 5000,
        })
      );
      return response.status === 200;
    } catch (error) {
      console.error('Walas API health check failed:', error);
      return false;
    }
  }
}
