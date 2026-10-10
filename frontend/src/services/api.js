const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

function buildApiUrl(path) {
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`;

  return `${baseUrl}${path}`;
}

// ==================== STUDENT SCHOLARSHIPS ====================

export async function getScholarships() {
  const response = await fetch(buildApiUrl("/scholarships"));

  if (!response.ok) {
    throw new Error("Failed to fetch scholarships");
  }

  return await response.json();
}

// ==================== STUDENT PROFILE ====================

export async function getStudentProfile(token) {
  const response = await fetch(buildApiUrl("/profile/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch student profile");
  }

  return data;
}

// ==================== STUDENT REGISTRATION ====================

export async function registerStudent(studentData) {
  const response = await fetch(buildApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
}

// ==================== STUDENT LOGIN ====================

export async function loginStudent(loginData) {
  const response = await fetch(buildApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

// ==================== SUBMIT SCHOLARSHIP APPLICATION ====================

export async function submitApplication(scholarshipId, token) {
  const response = await fetch(buildApiUrl("/applications"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      scholarship_id: Number(scholarshipId),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to submit scholarship application"
    );
  }

  return data;
}

// ==================== API BASE URL
export function getApiBaseUrl() {
  return API_BASE_URL;
}
// ==================== MY APPLICATIONS ====================

export async function getMyApplications(token) {
  const response = await fetch(buildApiUrl("/applications/my"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch applications");
  }

  return data;
}
// ==================== ADMIN LOGIN ====================

export async function loginAdmin(adminData) {
  const response = await fetch(buildApiUrl("/admin/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adminData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Admin login failed");
  }

  return data;
}

// ==================== ADMIN APPLICATIONS ====================

export async function getAllAdminApplications(token) {
  const response = await fetch(buildApiUrl("/admin/applications"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch applications");
  }

  return data;
}

// ==================== UPDATE APPLICATION STATUS ====================

export async function updateAdminApplicationStatus(
  applicationId,
  status,
  token
) {
  const response = await fetch(
    buildApiUrl(`/admin/applications/${applicationId}/status`),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update application status");
  }

  return data;
}
