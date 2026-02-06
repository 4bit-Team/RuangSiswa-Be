import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateBimbinganTables1707395000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. bimbingan_categories table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_categories',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_bimbingan_categories_is_active',
            columnNames: ['is_active'],
          }),
        ],
      }),
      true,
    );

    // 2. bimbingan_referrals table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_referrals',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'counselor_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'counselor_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tahun',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'risk_level',
            type: 'varchar',
            length: '20',
            default: "'green'",
          },
          {
            name: 'referral_reason',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'referral_source',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'referral_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'assigned_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'completed_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_urgent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_referrals_student_tahun',
            columnNames: ['student_id', 'tahun'],
          }),
          new TableIndex({
            name: 'IDX_referrals_counselor_status',
            columnNames: ['counselor_id', 'status'],
          }),
          new TableIndex({
            name: 'IDX_referrals_risk_level',
            columnNames: ['risk_level'],
          }),
        ],
      }),
      true,
    );

    // 3. bimbingan_sesi table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_sesi',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'referral_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'counselor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'counselor_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'sesi_ke',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'tanggal_sesi',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'jam_sesi',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'durasi_menit',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'lokasi',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'topik_pembahasan',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'catatan_sesi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'rekomendasi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'scheduled'",
          },
          {
            name: 'siswa_hadir',
            type: 'boolean',
            default: false,
          },
          {
            name: 'orang_tua_hadir',
            type: 'boolean',
            default: false,
          },
          {
            name: 'hasil_akhir',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'follow_up_status',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'follow_up_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_sesi_student_counselor_date',
            columnNames: ['student_id', 'counselor_id', 'tanggal_sesi'],
          }),
          new TableIndex({
            name: 'IDX_sesi_referral',
            columnNames: ['referral_id'],
          }),
          new TableIndex({
            name: 'IDX_sesi_status',
            columnNames: ['status'],
          }),
        ],
      }),
      true,
    );

    // 4. bimbingan_catat table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_catat',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'referral_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'sesi_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'counselor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'counselor_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'jenis_catat',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'isi_catat',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'tingkat_kerahasiaan',
            type: 'varchar',
            length: '50',
            default: "'confidential'",
          },
          {
            name: 'dokumen_lampiran',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'tanggal_catat',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'memerlukan_tindakan',
            type: 'boolean',
            default: false,
          },
          {
            name: 'tindakan_lanjutan',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_catat_referral',
            columnNames: ['referral_id'],
          }),
          new TableIndex({
            name: 'IDX_catat_student_date',
            columnNames: ['student_id', 'created_at'],
          }),
        ],
      }),
      true,
    );

    // 5. bimbingan_intervensi table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_intervensi',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'referral_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'counselor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'counselor_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'jenis_intervensi',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'deskripsi_intervensi',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'tanggal_intervensi',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'ongoing'",
          },
          {
            name: 'hasil_intervensi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tanggal_evaluasi',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'efektivitas',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_intervensi_referral',
            columnNames: ['referral_id'],
          }),
          new TableIndex({
            name: 'IDX_intervensi_student_date',
            columnNames: ['student_id', 'tanggal_intervensi'],
          }),
        ],
      }),
      true,
    );

    // 6. bimbingan_perkembangan table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_perkembangan',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'referral_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'counselor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'tanggal_evaluasi',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'perilaku_skor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'perilaku_catatan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'akademik_skor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'akademik_catatan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'emosi_skor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'emosi_catatan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'kehadiran_skor',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'kehadiran_catatan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status_keseluruhan',
            type: 'varchar',
            length: '50',
            default: "'in_progress'",
          },
          {
            name: 'rekomendasi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sesi_total_dijalankan',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_perkembangan_student_referral',
            columnNames: ['student_id', 'referral_id'],
          }),
          new TableIndex({
            name: 'IDX_perkembangan_tanggal_evaluasi',
            columnNames: ['tanggal_evaluasi'],
          }),
        ],
      }),
      true,
    );

    // 7. bimbingan_ability table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_ability',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'referral_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'nama_ayah',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'nama_ibu',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'pekerjaan_ayah',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'pekerjaan_ibu',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'alamat_rumah',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'nomor_hp_orang_tua',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'dinamika_keluarga',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'kondisi_ekonomi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'kondisi_rumah',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'kekuatan_siswa',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tantangan_siswa',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'kerja_sama_orang_tua',
            type: 'varchar',
            length: '50',
            default: "'moderate'",
          },
          {
            name: 'tanggal_penilaian',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_ability_student',
            columnNames: ['student_id'],
          }),
        ],
      }),
      true,
    );

    // 8. bimbingan_target table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_target',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'referral_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'counselor_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'area_target',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'target_spesifik',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'tanggal_mulai',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'tanggal_target',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'strategi_pencapaian',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
          },
          {
            name: 'catatan_evaluasi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tanggal_evaluasi',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_target_referral',
            columnNames: ['referral_id'],
          }),
          new TableIndex({
            name: 'IDX_target_student_status',
            columnNames: ['student_id', 'status'],
          }),
        ],
      }),
      true,
    );

    // 9. bimbingan_status table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_status',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'tahun',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'no_guidance'",
          },
          {
            name: 'current_risk_level',
            type: 'varchar',
            length: '20',
            default: "'green'",
          },
          {
            name: 'total_referrals',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_sessions',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_interventions',
            type: 'int',
            default: 0,
          },
          {
            name: 'first_referral_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'last_session_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'active_counselor_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'active_counselor_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'latest_referral_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'catatan_terbaru',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'next_session_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_status_student_tahun',
            columnNames: ['student_id', 'tahun'],
          }),
        ],
      }),
      true,
    );

    // 10. bimbingan_statistik table
    await queryRunner.createTable(
      new Table({
        name: 'bimbingan_statistik',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'tahun',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'total_violations',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_tardiness',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_absences',
            type: 'int',
            default: 0,
          },
          {
            name: 'avg_daily_attendance_rate',
            type: 'int',
            default: 0,
          },
          {
            name: 'avg_gpa',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
          },
          {
            name: 'failing_subjects',
            type: 'int',
            default: 0,
          },
          {
            name: 'risk_level',
            type: 'varchar',
            length: '20',
            default: "'green'",
          },
          {
            name: 'risk_factors',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'intervention_frequency',
            type: 'int',
            default: 0,
          },
          {
            name: 'improvement_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_statistik_student_tahun',
            columnNames: ['student_id', 'tahun'],
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order
    await queryRunner.dropTable('bimbingan_statistik', true);
    await queryRunner.dropTable('bimbingan_status', true);
    await queryRunner.dropTable('bimbingan_target', true);
    await queryRunner.dropTable('bimbingan_ability', true);
    await queryRunner.dropTable('bimbingan_perkembangan', true);
    await queryRunner.dropTable('bimbingan_intervensi', true);
    await queryRunner.dropTable('bimbingan_catat', true);
    await queryRunner.dropTable('bimbingan_sesi', true);
    await queryRunner.dropTable('bimbingan_referrals', true);
    await queryRunner.dropTable('bimbingan_categories', true);
  }
}
