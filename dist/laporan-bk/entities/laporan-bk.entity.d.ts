import { User } from '../../users/entities/user.entity';
import { Kelas } from '../../kelas/entities/kelas.entity';
import { Jurusan } from '../../jurusan/entities/jurusan.entity';
export type StatusPerkembanganPesertaDidik = 'Membaik' | 'Stabil' | 'Menurun' | 'Belum Terlihat Perubahan';
export declare class LaporanBk {
    id: number;
    namaKonseling: string;
    jurusanId: number;
    kelasId: number;
    tanggalDiprosesAiBk: Date;
    deskripsiKasusMasalah: string;
    bentukPenanganganSebelumnya: string;
    riwayatSpDanKasus: string;
    layananBk: string;
    followUpTindakanBk: string;
    penahanganGuruBkKonselingProsesPembinaan: string;
    pertemuanKe1: string;
    pertemuanKe2: string;
    pertemuanKe3: string;
    hasilPemantauanKeterangan: string;
    guruBkYangMenanganiId: number;
    statusPerkembanganPesertaDidik: StatusPerkembanganPesertaDidik;
    keteranganKetersedianDokumen: string;
    jurusan: Jurusan;
    kelas: Kelas;
    guruBkYangMenanganis: User;
    createdAt: Date;
    updatedAt: Date;
}
