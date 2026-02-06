import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateViolationTables1707335000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create violation_categories table (master data)
    await queryRunner.createTable(
      new Table({
        name: 'violation_categories',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
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
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'sp_trigger_count',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create violations table
    await queryRunner.createTable(
      new Table({
        name: 'violations',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'violation_category_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'bukti_foto',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'catatan_petugas',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'severity',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'is_processed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'sp_letter_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'tanggal_pelanggaran',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for violations
    await queryRunner.createIndex(
      'violations',
      new TableIndex({
        name: 'idx_violations_student_date',
        columnNames: ['student_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'violations',
      new TableIndex({
        name: 'idx_violations_student_category',
        columnNames: ['student_id', 'violation_category_id'],
      }),
    );

    await queryRunner.createIndex(
      'violations',
      new TableIndex({
        name: 'idx_violations_processed',
        columnNames: ['is_processed'],
      }),
    );

    // Create sp_letters table
    await queryRunner.createTable(
      new Table({
        name: 'sp_letters',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
          },
          {
            name: 'student_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'student_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'nis',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'sp_level',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'sp_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'sp_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'tahun',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'violations_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'violation_ids',
            type: 'json',
            isNullable: false,
          },
          {
            name: 'consequences',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'alamat_siswa',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'kompetensi_keahlian',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tanggal_sp',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'draft'",
          },
          {
            name: 'is_signed',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'signed_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'signed_by_parent',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'signed_by_bp_bk',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'signed_by_wali_kelas',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'material_cost',
            type: 'int',
            isNullable: true,
            default: 10000,
          },
          {
            name: 'pdf_path',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for sp_letters
    await queryRunner.createIndex(
      'sp_letters',
      new TableIndex({
        name: 'idx_sp_student_level',
        columnNames: ['student_id', 'sp_level'],
      }),
    );

    await queryRunner.createIndex(
      'sp_letters',
      new TableIndex({
        name: 'idx_sp_student_tahun',
        columnNames: ['student_id', 'tahun'],
      }),
    );

    await queryRunner.createIndex(
      'sp_letters',
      new TableIndex({
        name: 'idx_sp_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'sp_letters',
      new TableIndex({
        name: 'idx_sp_is_signed',
        columnNames: ['is_signed'],
      }),
    );

    // Create sp_progressions table
    await queryRunner.createTable(
      new Table({
        name: 'sp_progressions',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
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
            name: 'current_sp_level',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'violation_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'sp1_issued_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'sp2_issued_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'sp3_issued_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'first_sp_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'last_sp_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_expelled',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'expulsion_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'reason_if_expelled',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for sp_progressions
    await queryRunner.createIndex(
      'sp_progressions',
      new TableIndex({
        name: 'idx_progression_student_tahun',
        columnNames: ['student_id', 'tahun'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'sp_progressions',
      new TableIndex({
        name: 'idx_progression_sp_level',
        columnNames: ['current_sp_level'],
      }),
    );

    // Create violation_excuses table
    await queryRunner.createTable(
      new Table({
        name: 'violation_excuses',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
          },
          {
            name: 'violation_id',
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
            name: 'excuse_text',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'bukti_excuse',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'pending'",
          },
          {
            name: 'catatan_bk',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_resolved',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'resolved_by',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for violation_excuses
    await queryRunner.createIndex(
      'violation_excuses',
      new TableIndex({
        name: 'idx_excuse_violation_id',
        columnNames: ['violation_id'],
      }),
    );

    await queryRunner.createIndex(
      'violation_excuses',
      new TableIndex({
        name: 'idx_excuse_student_status',
        columnNames: ['student_id', 'status'],
      }),
    );

    // Create violation_statistics table
    await queryRunner.createTable(
      new Table({
        name: 'violation_statistics',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
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
            isNullable: false,
            default: 0,
          },
          {
            name: 'total_severity_score',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'average_severity',
            type: 'float',
            isNullable: false,
            default: 0,
          },
          {
            name: 'sp_count',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'risk_level',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'green'",
          },
          {
            name: 'most_common_violation',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for violation_statistics
    await queryRunner.createIndex(
      'violation_statistics',
      new TableIndex({
        name: 'idx_stats_student_tahun',
        columnNames: ['student_id', 'tahun'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'violation_statistics',
      new TableIndex({
        name: 'idx_stats_total_violations',
        columnNames: ['total_violations'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('violation_statistics', true);
    await queryRunner.dropTable('violation_excuses', true);
    await queryRunner.dropTable('sp_progressions', true);
    await queryRunner.dropTable('sp_letters', true);
    await queryRunner.dropTable('violations', true);
    await queryRunner.dropTable('violation_categories', true);
  }
}
