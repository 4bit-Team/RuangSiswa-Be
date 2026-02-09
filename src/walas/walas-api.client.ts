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

  // ========== SECTION A: STUDENT DATA APIs ==========

  /**
   * Get all students with optional filters
   * GET /api/v1/walas/students?class_id=X&year_ajaran=2025-2026&status=Aktif&page=1&limit=20
   */
  async getStudents(filters?: {
    class_id?: number;
    year_ajaran?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.class_id) params.append('class_id', filters.class_id.toString());
      if (filters?.year_ajaran) params.append('year_ajaran', filters.year_ajaran);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const url = this.buildUrl(`/api/v1/walas/students?${params.toString()}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getStudents');
    }
  }

  /**
   * Get single student detail
   * GET /api/v1/walas/students/{id}
   */
  async getStudentDetail(studentId: number) {
    try {
      const url = this.buildUrl(`/api/v1/walas/students/${studentId}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getStudentDetail');
    }
  }

  /**
   * Get all students in a class
   * GET /api/v1/walas/students/by-class/{classId}
   */
  async getClassStudents(classId: number) {
    try {
      const url = this.buildUrl(`/api/v1/walas/students/by-class/${classId}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getClassStudents');
    }
  }

  /**
   * Search students by name
   * GET /api/v1/walas/students/search?query=nama&limit=10
   */
  async searchStudents(query: string, limit: number = 10) {
    try {
      const url = this.buildUrl(
        `/api/v1/walas/students/search?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'searchStudents');
    }
  }

  // ========== SECTION B: ATTENDANCE DATA APIs ==========

  /**
   * Get attendance records with filters
   * GET /api/v1/walas/attendance?student_id=X&class_id=Y&start_date=2025-01-01&end_date=2025-01-31
   */
  async getAttendanceRecords(filters?: {
    student_id?: number;
    class_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.student_id) params.append('student_id', filters.student_id.toString());
      if (filters?.class_id) params.append('class_id', filters.class_id.toString());
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const url = this.buildUrl(`/api/v1/walas/attendance?${params.toString()}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAttendanceRecords');
    }
  }

  /**
   * Get attendance for specific month
   * GET /api/v1/walas/attendance/{studentId}/month/{month}
   */
  async getAttendanceByMonth(studentId: number, month: string) {
    try {
      const url = this.buildUrl(`/api/v1/walas/attendance/${studentId}/month/${month}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAttendanceByMonth');
    }
  }

  /**
   * Get attendance statistics for student
   * GET /api/v1/walas/attendance/{studentId}/stats?year_month=2025-01
   */
  async getAttendanceStats(studentId: number, yearMonth?: string) {
    try {
      const query = yearMonth ? `?year_month=${yearMonth}` : '';
      const url = this.buildUrl(`/api/v1/walas/attendance/${studentId}/stats${query}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAttendanceStats');
    }
  }

  /**
   * Get flagged students (high absence)
   * GET /api/v1/walas/attendance/flagged?threshold=5&month=2025-01
   */
  async getFlaggedStudents(threshold: number = 5, month?: string) {
    try {
      const params = new URLSearchParams();
      params.append('threshold', threshold.toString());
      if (month) params.append('month', month);

      const url = this.buildUrl(`/api/v1/walas/attendance/flagged?${params.toString()}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getFlaggedStudents');
    }
  }

  /**
   * Get class attendance for specific date
   * GET /api/v1/walas/attendance/class/{classId}/date/{date}
   */
  async getClassAttendanceByDate(classId: number, date: string) {
    try {
      const url = this.buildUrl(
        `/api/v1/walas/attendance/class/${classId}/date/${date}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getClassAttendanceByDate');
    }
  }

  // ========== SECTION C: CASE NOTES APIs ==========

  /**
   * Get all case notes with filters
   * GET /api/v1/walas/case-notes?start_date=2025-01-01&end_date=2025-01-31&limit=100&page=1
   */
  async getAllCaseNotes(filters?: {
    start_date?: string;
    end_date?: string;
    walas_id?: number;
    limit?: number;
    page?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.walas_id) params.append('walas_id', filters.walas_id.toString());
      if (filters?.limit) params.append('limit', (filters.limit || 100).toString());
      if (filters?.page) params.append('page', (filters.page || 1).toString());

      const url = this.buildUrl(
        `/api/v1/walas/case-notes${params.toString() ? '?' + params.toString() : ''}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAllCaseNotes');
    }
  }

  /**
   * Get case notes for a specific student
   * GET /api/v1/walas/case-notes/byStudent/{studentId}
   */
  async getCaseNotes(studentId: number, filters?: {
    limit?: number;
    page?: number;
  }) {
    try {
      const query = new URLSearchParams();
      if (filters?.limit) query.append('limit', filters.limit.toString());
      if (filters?.page) query.append('page', filters.page.toString());

      const url = this.buildUrl(
        `/api/v1/walas/case-notes/byStudent/${studentId}${query.toString() ? '?' + query.toString() : ''}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getCaseNotes');
    }
  }

  /**
   * Get case notes by walas
   * GET /api/v1/walas/case-notes/byWalas/{walasId}
   */
  async getCaseNotesByWalas(walasId: number, filters?: {
    limit?: number;
    page?: number;
  }) {
    try {
      const query = new URLSearchParams();
      if (filters?.limit) query.append('limit', filters.limit.toString());
      if (filters?.page) query.append('page', filters.page.toString());

      const url = this.buildUrl(
        `/api/v1/walas/case-notes/byWalas/${walasId}${query.toString() ? '?' + query.toString() : ''}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getCaseNotesByWalas');
    }
  }

  /**
   * Get recent case notes for student
   * GET /api/v1/walas/case-notes/{studentId}/recent?limit=5
   */
  async getRecentCaseNotes(studentId: number, limit: number = 5) {
    try {
      const url = this.buildUrl(
        `/api/v1/walas/case-notes/${studentId}/recent?limit=${limit}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getRecentCaseNotes');
    }
  }

  /**
   * Get all home visits with pagination and filters
   * GET /api/v1/walas/home-visits?page=1&per_page=20&student_id=123&status=completed
   */
  async getHomeVisits(filters: {
    page?: number;
    per_page?: number;
    student_id?: number;
    walas_id?: number;
    status?: string;
    class_id?: number;
    date_from?: string;
    date_to?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = this.buildUrl(`/api/v1/walas/home-visits?${params.toString()}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getHomeVisits');
    }
  }

  /**
   * Get single home visit detail
   * GET /api/v1/walas/home-visits/{id}
   */
  async getHomeVisitDetail(id: number) {
    try {
      const url = this.buildUrl(`/api/v1/walas/home-visits/${id}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getHomeVisitDetail');
    }
  }

  /**
   * Get home visits for specific student
   * GET /api/v1/walas/home-visits/student/{studentId}?limit=50
   */
  async getHomeVisitsByStudent(studentId: number, limit: number = 50) {
    try {
      const url = this.buildUrl(
        `/api/v1/walas/home-visits/student/${studentId}?limit=${limit}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getHomeVisitsByStudent');
    }
  }

  /**
   * Get home visits conducted by specific Walas/teacher
   * GET /api/v1/walas/home-visits/walas/{walasId}?page=1&per_page=20
   */
  async getHomeVisitsByWalas(walasId: number, page: number = 1, per_page: number = 20) {
    try {
      const url = this.buildUrl(
        `/api/v1/walas/home-visits/walas/${walasId}?page=${page}&per_page=${per_page}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getHomeVisitsByWalas');
    }
  }

  /**
   * Get home visit statistics
   * GET /api/v1/walas/home-visits/stats?class_id=1&date_from=2025-01-01&date_to=2025-02-06
   */
  async getHomeVisitStats(filters: {
    class_id?: number;
    date_from?: string;
    date_to?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = this.buildUrl(`/api/v1/walas/home-visits/stats?${params.toString()}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getHomeVisitStats');
    }
  }

  /**
   * Get all achievements with pagination and filters
   * GET /api/v1/walas/achievements?page=1&per_page=20&student_id=123&type=academic
   */
  async getAchievements(filters: {
    page?: number;
    per_page?: number;
    student_id?: number;
    walas_id?: number;
    type?: string;
    category_id?: number;
    class_id?: number;
    date_from?: string;
    date_to?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = this.buildUrl(`/api/v1/walas/achievements?${params.toString()}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAchievements');
    }
  }

  /**
   * Get single achievement detail
   * GET /api/v1/walas/achievements/{id}
   */
  async getAchievementDetail(id: number) {
    try {
      const url = this.buildUrl(`/api/v1/walas/achievements/${id}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAchievementDetail');
    }
  }

  /**
   * Get achievements for specific student
   * GET /api/v1/walas/achievements/student/{studentId}?limit=100&type=academic
   */
  async getAchievementsByStudent(studentId: number, filters: {
    type?: string;
    limit?: number;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = this.buildUrl(
        `/api/v1/walas/achievements/student/${studentId}?${params.toString()}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAchievementsByStudent');
    }
  }

  /**
   * Get achievements by type filter
   * GET /api/v1/walas/achievements/type/{type}?page=1&per_page=20
   */
  async getAchievementsByType(type: string, filters: {
    page?: number;
    per_page?: number;
    class_id?: number;
    date_from?: string;
    date_to?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = this.buildUrl(
        `/api/v1/walas/achievements/type/${type}?${params.toString()}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAchievementsByType');
    }
  }

  /**
   * Get achievements added by specific Walas/teacher
   * GET /api/v1/walas/achievements/walas/{walasId}?page=1&per_page=20
   */
  async getAchievementsByWalas(walasId: number, filters: {
    page?: number;
    per_page?: number;
    date_from?: string;
    date_to?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = this.buildUrl(
        `/api/v1/walas/achievements/walas/${walasId}?${params.toString()}`
      );
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAchievementsByWalas');
    }
  }

  /**
   * Get achievement statistics
   * GET /api/v1/walas/achievements/stats?class_id=1&date_from=2025-01-01
   */
  async getAchievementStats(filters: {
    class_id?: number;
    date_from?: string;
    date_to?: string;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = this.buildUrl(`/api/v1/walas/achievements/stats?${params.toString()}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAchievementStats');
    }
  }

  /**
   * Get achievement statistics by type breakdown
   * GET /api/v1/walas/achievements/type-stats?class_id=1
   */
  async getAchievementTypeStats(classId?: number) {
    try {
      const params = classId ? `?class_id=${classId}` : '';
      const url = this.buildUrl(`/api/v1/walas/achievements/type-stats${params}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getAchievementTypeStats');
    }
  }

  // ========== SECTION G: WALAS/TEACHER DATA APIs ==========

  /**
   * Get walas (teacher) info by ID
   * GET /api/v1/walas/walas/{id}
   */
  async getWalasById(walasId: number) {
    try {
      const url = this.buildUrl(`/api/v1/walas/walas/${walasId}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() })
      );

      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getWalasById');
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
