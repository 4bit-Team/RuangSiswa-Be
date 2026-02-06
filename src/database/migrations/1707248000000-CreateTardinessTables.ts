import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTardinessTables1707248000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tardiness_records table
    await queryRunner.createTable(
      new Table({
        name: 'tardiness_records',
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
            name: 'tanggal',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'keterlambatan_menit',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'submitted'",
          },
          {
            name: 'alasan',
            type: 'text',
            isNullable: true,
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
            name: 'has_appeal',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
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
          {
            name: 'verified_by',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for tardiness_records
    await queryRunner.createIndex(
      'tardiness_records',
      new TableIndex({
        name: 'idx_tardiness_student_date',
        columnNames: ['student_id', 'tanggal'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'tardiness_records',
      new TableIndex({
        name: 'idx_tardiness_class_date',
        columnNames: ['class_id', 'tanggal'],
      }),
    );

    await queryRunner.createIndex(
      'tardiness_records',
      new TableIndex({
        name: 'idx_tardiness_student_status',
        columnNames: ['student_id', 'status'],
      }),
    );

    // Create tardiness_appeals table
    await queryRunner.createTable(
      new Table({
        name: 'tardiness_appeals',
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
            name: 'tardiness_record_id',
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
            name: 'alasan_appeal',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'bukti_appeal',
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
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for tardiness_appeals
    await queryRunner.createIndex(
      'tardiness_appeals',
      new TableIndex({
        name: 'idx_appeal_tardiness_record',
        columnNames: ['tardiness_record_id'],
      }),
    );

    await queryRunner.createIndex(
      'tardiness_appeals',
      new TableIndex({
        name: 'idx_appeal_student_status',
        columnNames: ['student_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'tardiness_appeals',
      new TableIndex({
        name: 'idx_appeal_resolved',
        columnNames: ['is_resolved'],
      }),
    );

    // Create tardiness_summaries table
    await queryRunner.createTable(
      new Table({
        name: 'tardiness_summaries',
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
            name: 'class_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'tahun_bulan',
            type: 'varchar',
            length: '7',
            isNullable: false,
          },
          {
            name: 'count_total',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'count_verified',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'count_disputed',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'total_menit',
            type: 'int',
            isNullable: false,
            default: 0,
          },
          {
            name: 'threshold_status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'ok'",
          },
          {
            name: 'is_flagged',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'reason_if_flagged',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for tardiness_summaries
    await queryRunner.createIndex(
      'tardiness_summaries',
      new TableIndex({
        name: 'idx_summary_student_month',
        columnNames: ['student_id', 'tahun_bulan'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'tardiness_summaries',
      new TableIndex({
        name: 'idx_summary_flagged',
        columnNames: ['is_flagged'],
      }),
    );

    await queryRunner.createIndex(
      'tardiness_summaries',
      new TableIndex({
        name: 'idx_summary_threshold',
        columnNames: ['count_total', 'threshold_status'],
      }),
    );

    // Create tardiness_alerts table
    await queryRunner.createTable(
      new Table({
        name: 'tardiness_alerts',
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
            name: 'alert_type',
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
            name: 'severity',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'warning'",
          },
          {
            name: 'alert_data',
            type: 'json',
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
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for tardiness_alerts
    await queryRunner.createIndex(
      'tardiness_alerts',
      new TableIndex({
        name: 'idx_alert_student_type',
        columnNames: ['student_id', 'alert_type'],
      }),
    );

    await queryRunner.createIndex(
      'tardiness_alerts',
      new TableIndex({
        name: 'idx_alert_resolved',
        columnNames: ['is_resolved'],
      }),
    );

    // Create tardiness_patterns table (optional for pattern detection)
    await queryRunner.createTable(
      new Table({
        name: 'tardiness_patterns',
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
            name: 'pattern_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'pattern_description',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'confidence_score',
            type: 'float',
            isNullable: false,
          },
          {
            name: 'occurrences',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create index for tardiness_patterns
    await queryRunner.createIndex(
      'tardiness_patterns',
      new TableIndex({
        name: 'idx_pattern_student',
        columnNames: ['student_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (due to dependencies)
    await queryRunner.dropTable('tardiness_patterns', true);
    await queryRunner.dropTable('tardiness_alerts', true);
    await queryRunner.dropTable('tardiness_summaries', true);
    await queryRunner.dropTable('tardiness_appeals', true);
    await queryRunner.dropTable('tardiness_records', true);
  }
}
