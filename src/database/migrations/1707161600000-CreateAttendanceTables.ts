import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateAttendanceTables1707161600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create attendance_records table
    await queryRunner.createTable(
      new Table({
        name: 'attendance_records',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'student_id',
            type: 'bigint',
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
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'tanggal',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['H', 'S', 'I', 'A'],
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'synced_from_walas',
            type: 'boolean',
            default: true,
          },
          {
            name: 'synced_at',
            type: 'timestamp',
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
          {
            name: 'idx_student_date',
            columnNames: ['student_id', 'tanggal'],
            isUnique: true,
          },
          {
            name: 'idx_class_date',
            columnNames: ['class_id', 'tanggal'],
          },
        ],
      }),
      true,
    );

    // Create attendance_summaries table
    await queryRunner.createTable(
      new Table({
        name: 'attendance_summaries',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'student_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'class_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'tahun_bulan',
            type: 'varchar',
            length: '7',
            isNullable: false,
          },
          {
            name: 'total_hadir',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_sakit',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_izin',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_alpa',
            type: 'int',
            default: 0,
          },
          {
            name: 'total_days_expected',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'attendance_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'is_flagged',
            type: 'boolean',
            default: false,
          },
          {
            name: 'reason_if_flagged',
            type: 'varchar',
            length: '255',
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
          {
            name: 'idx_student_month',
            columnNames: ['student_id', 'tahun_bulan'],
            isUnique: true,
          },
          {
            name: 'idx_flagged',
            columnNames: ['is_flagged'],
          },
        ],
      }),
      true,
    );

    // Create attendance_alerts table
    await queryRunner.createTable(
      new Table({
        name: 'attendance_alerts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'student_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'alert_type',
            type: 'enum',
            enum: ['high_alpa', 'low_attendance', 'pattern_change'],
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['warning', 'critical'],
            default: "'warning'",
          },
          {
            name: 'is_resolved',
            type: 'boolean',
            default: false,
          },
          {
            name: 'resolved_by',
            type: 'bigint',
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
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'idx_student_alert',
            columnNames: ['student_id', 'alert_type'],
          },
          {
            name: 'idx_unresolved',
            columnNames: ['is_resolved'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('attendance_alerts', true);
    await queryRunner.dropTable('attendance_summaries', true);
    await queryRunner.dropTable('attendance_records', true);
  }
}
