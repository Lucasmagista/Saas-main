// Tipos para tabelas de RH criadas
export type Candidate = {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone?: string;
  applied_job_id?: string;
  resume_url?: string;
  stage: string;
  score?: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Resume = {
  id: string;
  candidate_id: string;
  file_url: string;
  skills?: string[];
  experience_years?: number;
  education?: string;
  created_at: string;
};

export type Job = {
  id: string;
  organization_id: string;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  salary?: string;
  status: string;
  description?: string;
  requirements?: string[];
  created_at: string;
  deadline?: string;
};

export type CompliancePolicy = {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  version?: string;
  last_update?: string;
  status: string;
  compliance?: number;
  assigned_employees?: number;
  acknowledged_by?: number;
  category?: string;
  created_at: string;
};
