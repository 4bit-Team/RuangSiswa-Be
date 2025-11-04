src/
 ├─ auth/
 │   ├─ auth.module.ts
 │   ├─ auth.service.ts
 │   ├─ auth.controller.ts
 │   ├─ dto/
 │   │   ├─ login.dto.ts
 │   │   └─ register.dto.ts
 ├─ users/
 │   ├─ users.module.ts
 │   ├─ users.service.ts
 │   ├─ users.controller.ts
 │   ├─ dto/
 │   │   ├─ create-user.dto.ts
 │   │   └─ update-user.dto.ts
 │   └─ entities/
 │       └─ user.entity.ts
 └─ student-card/
     ├─ student-card.module.ts
     ├─ student-card.service.ts
     ├─ student-card.controller.ts
     ├─ dto/
     │   └─ create-student-card.dto.ts
     └─ entities/
         └─ student-card.entity.ts


1. Alur Register

Input username, email, password dan upload scan kartu_pelajar_file.
Simpan record baru di Users.
Simpan record di Student_Card (optional, untuk histori).
Password harus di-hash sebelum disimpan.


2. Alur Login

Input email + password.
Cari user berdasarkan email di Users.
Verifikasi password dengan hash.
Jika berhasil, buat JWT (token) atau session.