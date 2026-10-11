export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'receptionist' | 'doctor' | 'nurse' | 'patient' | 'pharmacist' | 'lab_technician'
export type RelationshipType =
  | 'parent'
  | 'child'
  | 'spouse'
  | 'sibling'
  | 'guardian'
  | 'ward'
  | 'other'
export type MedicineStatus = 'active' | 'completed' | 'stopped'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          phone: string | null
          address: string | null
          aadhaar_number: string | null
          gov_reg_number: string | null
          department: string | null
          approval_status: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: UserRole
          phone?: string | null
          address?: string | null
          aadhaar_number?: string | null
          gov_reg_number?: string | null
          department?: string | null
          approval_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: UserRole
          phone?: string | null
          address?: string | null
          aadhaar_number?: string | null
          gov_reg_number?: string | null
          department?: string | null
          approval_status?: string
          created_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          user_id: string | null
          name: string
          dob: string
          gender: string | null
          phone: string | null
          address: string | null
          aadhaar_number: string | null
          approval_status: string
          allergies: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          dob: string
          gender?: string | null
          phone?: string | null
          address?: string | null
          aadhaar_number?: string | null
          approval_status?: string
          allergies?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          dob?: string
          gender?: string | null
          phone?: string | null
          address?: string | null
          aadhaar_number?: string | null
          approval_status?: string
          allergies?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      families: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          patient_id: string
          is_emergency_contact: boolean
          removed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          patient_id: string
          is_emergency_contact?: boolean
          removed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          patient_id?: string
          is_emergency_contact?: boolean
          removed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_relationships: {
        Row: {
          id: string
          patient_id: string
          related_patient_id: string
          relationship: RelationshipType
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          related_patient_id: string
          relationship: RelationshipType
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          related_patient_id?: string
          relationship?: RelationshipType
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_relationships_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_relationships_related_patient_id_fkey"
            columns: ["related_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      family_history: {
        Row: {
          id: string
          patient_id: string
          condition: string
          relative: string | null
          notes: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          condition: string
          relative?: string | null
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          condition?: string
          relative?: string | null
          notes?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_history_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      visits: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          visit_date: string
          symptoms: string | null
          diagnosis: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          visit_date?: string
          symptoms?: string | null
          diagnosis?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          visit_date?: string
          symptoms?: string | null
          diagnosis?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      vitals: {
        Row: {
          id: string
          patient_id: string
          recorded_by: string
          bp_systolic: number | null
          bp_diastolic: number | null
          pulse: number | null
          temp_c: number | null
          weight_kg: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          recorded_by: string
          bp_systolic?: number | null
          bp_diastolic?: number | null
          pulse?: number | null
          temp_c?: number | null
          weight_kg?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          recorded_by?: string
          bp_systolic?: number | null
          bp_diastolic?: number | null
          pulse?: number | null
          temp_c?: number | null
          weight_kg?: number | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      medicine_cycles: {
        Row: {
          id: string
          patient_id: string
          prescribed_by: string | null
          drug: string
          dose: string
          frequency: string
          start_date: string
          end_date: string | null
          status: MedicineStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          prescribed_by?: string | null
          drug: string
          dose: string
          frequency: string
          start_date: string
          end_date?: string | null
          status?: MedicineStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          prescribed_by?: string | null
          drug?: string
          dose?: string
          frequency?: string
          start_date?: string
          end_date?: string | null
          status?: MedicineStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_cycles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_cycles_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      summaries: {
        Row: {
          id: string
          patient_id: string
          content: string
          model: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          content: string
          model?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          content?: string
          model?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "summaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string | null
          department: string
          appointment_date: string
          appointment_time: string
          symptoms: string
          status: string
          doctor_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id?: string | null
          department: string
          appointment_date: string
          appointment_time: string
          symptoms: string
          status?: string
          doctor_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string | null
          department?: string
          appointment_date?: string
          appointment_time?: string
          symptoms?: string
          status?: string
          doctor_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      medicine_orders: {
        Row: {
          id: string
          patient_id: string
          items: Json
          total_amount: number
          delivery_address: string
          phone: string
          status: string
          pharmacist_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          items?: Json
          total_amount?: number
          delivery_address: string
          phone: string
          status?: string
          pharmacist_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          items?: Json
          total_amount?: number
          delivery_address?: string
          phone?: string
          status?: string
          pharmacist_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_role: {
        Args: Record<PropertyKey, never>
        Returns: UserRole
      }
      my_patient_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      can_view_patient: {
        Args: {
          pid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      relationship_type: RelationshipType
      medicine_status: MedicineStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
