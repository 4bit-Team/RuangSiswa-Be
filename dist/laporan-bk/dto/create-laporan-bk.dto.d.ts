export type StatusPerkembanganPesertaDidik = 'Membaik' | 'Stabil' | 'Menurun' | 'Belum Terlihat Perubahan';
export declare class CreateLaporanBkDto {
    namaKonseling: string;
    jurusanId?: number;
    kelasId?: number;
    tanggalDiprosesAiBk: Date;
    deskripsiKasusMasalah: string;
    bentukPenanganganSebelumnya?: string;
    riwayatSpDanKasus?: string;
    layananBk?: string;
    followUpTindakanBk?: string;
    penahanganGuruBkKonselingProsesPembinaan?: string;
    pertemuanKe1?: string;
    pertemuanKe2?: string;
    pertemuanKe3?: string;
    hasilPemantauanKeterangan?: string;
    guruBkYangMenanganiId?: number;
    statusPerkembanganPesertaDidik?: StatusPerkembanganPesertaDidik;
    keteranganKetersedianDokumen?: string;
}
