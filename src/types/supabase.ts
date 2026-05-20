export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      asistencia: {
        Row: {
          cliente_id: string
          fecha_hora_entrada: string | null
          fecha_hora_salida: string | null
          gimnasio_id: string | null
          id: string
          metodo_registro: string | null
          registrado_por: string | null
        }
        Insert: {
          cliente_id: string
          fecha_hora_entrada?: string | null
          fecha_hora_salida?: string | null
          gimnasio_id?: string | null
          id?: string
          metodo_registro?: string | null
          registrado_por?: string | null
        }
        Update: {
          cliente_id?: string
          fecha_hora_entrada?: string | null
          fecha_hora_salida?: string | null
          gimnasio_id?: string | null
          id?: string
          metodo_registro?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencia_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cajas: {
        Row: {
          created_at: string | null
          diferencia: number | null
          estado: string
          fecha_apertura: string | null
          fecha_cierre: string | null
          gimnasio_id: string | null
          id: string
          monto_apertura: number
          monto_cierre_esperado: number | null
          monto_cierre_real: number | null
          observaciones: string | null
          usuario_id_apertura: string | null
          usuario_id_cierre: string | null
        }
        Insert: {
          created_at?: string | null
          diferencia?: number | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          gimnasio_id?: string | null
          id?: string
          monto_apertura?: number
          monto_cierre_esperado?: number | null
          monto_cierre_real?: number | null
          observaciones?: string | null
          usuario_id_apertura?: string | null
          usuario_id_cierre?: string | null
        }
        Update: {
          created_at?: string | null
          diferencia?: number | null
          estado?: string
          fecha_apertura?: string | null
          fecha_cierre?: string | null
          gimnasio_id?: string | null
          id?: string
          monto_apertura?: number
          monto_cierre_esperado?: number | null
          monto_cierre_real?: number | null
          observaciones?: string | null
          usuario_id_apertura?: string | null
          usuario_id_cierre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cajas_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cajas_usuario_id_apertura_fkey"
            columns: ["usuario_id_apertura"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cajas_usuario_id_cierre_fkey"
            columns: ["usuario_id_cierre"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clases: {
        Row: {
          activa: boolean | null
          color: string | null
          created_at: string | null
          cupo_maximo: number | null
          dia_semana: string | null
          entrenador_id: string | null
          gimnasio_id: string | null
          hora_fin: string | null
          hora_inicio: string
          id: string
          nombre: string
          sala: string | null
        }
        Insert: {
          activa?: boolean | null
          color?: string | null
          created_at?: string | null
          cupo_maximo?: number | null
          dia_semana?: string | null
          entrenador_id?: string | null
          gimnasio_id?: string | null
          hora_fin?: string | null
          hora_inicio: string
          id?: string
          nombre: string
          sala?: string | null
        }
        Update: {
          activa?: boolean | null
          color?: string | null
          created_at?: string | null
          cupo_maximo?: number | null
          dia_semana?: string | null
          entrenador_id?: string | null
          gimnasio_id?: string | null
          hora_fin?: string | null
          hora_inicio?: string
          id?: string
          nombre?: string
          sala?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clases_entrenador_id_fkey"
            columns: ["entrenador_id"]
            isOneToOne: false
            referencedRelation: "entrenadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clases_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          acepta_habeas_data: boolean | null
          avatar_theme: string | null
          barrio: string | null
          ciudad: string | null
          codigo_qr: string | null
          condiciones_medicas: string | null
          contacto_emergencia_nombre: string | null
          contacto_emergencia_telefono: string | null
          created_at: string | null
          departamento: string | null
          direccion: string | null
          email: string | null
          estado: string | null
          fecha_nacimiento: string | null
          foto_url: string | null
          genero: string | null
          gimnasio_id: string | null
          id: string
          nombre: string
          numero_documento: string
          objetivos: string | null
          portal_password: string | null
          telefono: string | null
          tipo_documento: string | null
          updated_at: string | null
        }
        Insert: {
          acepta_habeas_data?: boolean | null
          avatar_theme?: string | null
          barrio?: string | null
          ciudad?: string | null
          codigo_qr?: string | null
          condiciones_medicas?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          created_at?: string | null
          departamento?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          gimnasio_id?: string | null
          id?: string
          nombre: string
          numero_documento: string
          objetivos?: string | null
          portal_password?: string | null
          telefono?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
        }
        Update: {
          acepta_habeas_data?: boolean | null
          avatar_theme?: string | null
          barrio?: string | null
          ciudad?: string | null
          codigo_qr?: string | null
          condiciones_medicas?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          created_at?: string | null
          departamento?: string | null
          direccion?: string | null
          email?: string | null
          estado?: string | null
          fecha_nacimiento?: string | null
          foto_url?: string | null
          genero?: string | null
          gimnasio_id?: string | null
          id?: string
          nombre?: string
          numero_documento?: string
          objetivos?: string | null
          portal_password?: string | null
          telefono?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      entrenadores: {
        Row: {
          created_at: string | null
          email: string | null
          especialidad: string | null
          estado: string | null
          formacion: string | null
          foto_url: string | null
          gimnasio_id: string | null
          horario_disponibilidad: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          especialidad?: string | null
          estado?: string | null
          formacion?: string | null
          foto_url?: string | null
          gimnasio_id?: string | null
          horario_disponibilidad?: string | null
          id?: string
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          especialidad?: string | null
          estado?: string | null
          formacion?: string | null
          foto_url?: string | null
          gimnasio_id?: string | null
          horario_disponibilidad?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entrenadores_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      exoneraciones: {
        Row: {
          creado_en: string | null
          descripcion: string | null
          dias_compensados: number
          fecha_cierre: string
          gimnasio_id: string | null
          id: string
        }
        Insert: {
          creado_en?: string | null
          descripcion?: string | null
          dias_compensados: number
          fecha_cierre: string
          gimnasio_id?: string | null
          id?: string
        }
        Update: {
          creado_en?: string | null
          descripcion?: string | null
          dias_compensados?: number
          fecha_cierre?: string
          gimnasio_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exoneraciones_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      gimnasios: {
        Row: {
          activo: boolean | null
          aforo_maximo: number | null
          ciudad: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          horario_apertura: string | null
          horario_cierre: string | null
          id: string
          logo_url: string | null
          modulo_dian_activo: boolean | null
          nit: string | null
          nombre: string
          telefono: string | null
          tope_factura_electronica: number | null
          updated_at: string | null
          vencimiento_licencia: string | null
        }
        Insert: {
          activo?: boolean | null
          aforo_maximo?: number | null
          ciudad?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          id?: string
          logo_url?: string | null
          modulo_dian_activo?: boolean | null
          nit?: string | null
          nombre: string
          telefono?: string | null
          tope_factura_electronica?: number | null
          updated_at?: string | null
          vencimiento_licencia?: string | null
        }
        Update: {
          activo?: boolean | null
          aforo_maximo?: number | null
          ciudad?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          horario_apertura?: string | null
          horario_cierre?: string | null
          id?: string
          logo_url?: string | null
          modulo_dian_activo?: boolean | null
          nit?: string | null
          nombre?: string
          telefono?: string | null
          tope_factura_electronica?: number | null
          updated_at?: string | null
          vencimiento_licencia?: string | null
        }
        Relationships: []
      }
      historial_ajustes_dias: {
        Row: {
          created_at: string | null
          dias_anteriores: number
          dias_diferencia: number
          dias_nuevos: number
          gimnasio_id: string | null
          id: string
          membresia_id: string | null
          motivo: string | null
          registrado_por: string | null
        }
        Insert: {
          created_at?: string | null
          dias_anteriores: number
          dias_diferencia: number
          dias_nuevos: number
          gimnasio_id?: string | null
          id?: string
          membresia_id?: string | null
          motivo?: string | null
          registrado_por?: string | null
        }
        Update: {
          created_at?: string | null
          dias_anteriores?: number
          dias_diferencia?: number
          dias_nuevos?: number
          gimnasio_id?: string | null
          id?: string
          membresia_id?: string | null
          motivo?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_ajustes_dias_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_ajustes_dias_membresia_id_fkey"
            columns: ["membresia_id"]
            isOneToOne: false
            referencedRelation: "membresias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_ajustes_dias_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones_clases: {
        Row: {
          asistio: boolean | null
          clase_id: string
          cliente_id: string
          fecha_inscripcion: string | null
          gimnasio_id: string | null
          id: string
        }
        Insert: {
          asistio?: boolean | null
          clase_id: string
          cliente_id: string
          fecha_inscripcion?: string | null
          gimnasio_id?: string | null
          id?: string
        }
        Update: {
          asistio?: boolean | null
          clase_id?: string
          cliente_id?: string
          fecha_inscripcion?: string | null
          gimnasio_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_clases_clase_id_fkey"
            columns: ["clase_id"]
            isOneToOne: false
            referencedRelation: "clases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_clases_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_clases_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      medidas: {
        Row: {
          brazo_derecho: number | null
          brazo_izquierdo: number | null
          cadera: number | null
          cintura: number | null
          cliente_id: string
          created_at: string | null
          estatura: number | null
          fecha_medicion: string | null
          gimnasio_id: string | null
          id: string
          imc: number | null
          masa_muscular: number | null
          medido_por: string | null
          muslo_derecho: number | null
          muslo_izquierdo: number | null
          notas: string | null
          pecho: number | null
          peso: number | null
          porcentaje_grasa: number | null
        }
        Insert: {
          brazo_derecho?: number | null
          brazo_izquierdo?: number | null
          cadera?: number | null
          cintura?: number | null
          cliente_id: string
          created_at?: string | null
          estatura?: number | null
          fecha_medicion?: string | null
          gimnasio_id?: string | null
          id?: string
          imc?: number | null
          masa_muscular?: number | null
          medido_por?: string | null
          muslo_derecho?: number | null
          muslo_izquierdo?: number | null
          notas?: string | null
          pecho?: number | null
          peso?: number | null
          porcentaje_grasa?: number | null
        }
        Update: {
          brazo_derecho?: number | null
          brazo_izquierdo?: number | null
          cadera?: number | null
          cintura?: number | null
          cliente_id?: string
          created_at?: string | null
          estatura?: number | null
          fecha_medicion?: string | null
          gimnasio_id?: string | null
          id?: string
          imc?: number | null
          masa_muscular?: number | null
          medido_por?: string | null
          muslo_derecho?: number | null
          muslo_izquierdo?: number | null
          notas?: string | null
          pecho?: number | null
          peso?: number | null
          porcentaje_grasa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medidas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medidas_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medidas_medido_por_fkey"
            columns: ["medido_por"]
            isOneToOne: false
            referencedRelation: "entrenadores"
            referencedColumns: ["id"]
          },
        ]
      }
      membresias: {
        Row: {
          cliente_id: string
          created_at: string | null
          dias_congelados: number | null
          estado: string | null
          fecha_fin: string
          fecha_inicio: string
          gimnasio_id: string | null
          id: string
          plan_id: string
          updated_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          dias_congelados?: number | null
          estado?: string | null
          fecha_fin: string
          fecha_inicio?: string
          gimnasio_id?: string | null
          id?: string
          plan_id: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          dias_congelados?: number | null
          estado?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          gimnasio_id?: string | null
          id?: string
          plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membresias_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membresias_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membresias_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_caja: {
        Row: {
          caja_id: string | null
          concepto: string
          created_at: string | null
          fecha: string | null
          gimnasio_id: string | null
          id: string
          iva_monto: number | null
          metodo_pago: string
          monto: number
          pago_id: string | null
          subtotal: number | null
          tipo: string
          venta_id: string | null
        }
        Insert: {
          caja_id?: string | null
          concepto: string
          created_at?: string | null
          fecha?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_monto?: number | null
          metodo_pago?: string
          monto: number
          pago_id?: string | null
          subtotal?: number | null
          tipo: string
          venta_id?: string | null
        }
        Update: {
          caja_id?: string | null
          concepto?: string
          created_at?: string | null
          fecha?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_monto?: number | null
          metodo_pago?: string
          monto?: number
          pago_id?: string | null
          subtotal?: number | null
          tipo?: string
          venta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_caja_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_pago_id_fkey"
            columns: ["pago_id"]
            isOneToOne: false
            referencedRelation: "pagos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_caja_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_medicas: {
        Row: {
          cliente_id: string
          contenido: string
          creado_por: string | null
          created_at: string | null
          gimnasio_id: string | null
          id: string
          prioridad: string | null
          tipo: string | null
        }
        Insert: {
          cliente_id: string
          contenido: string
          creado_por?: string | null
          created_at?: string | null
          gimnasio_id?: string | null
          id?: string
          prioridad?: string | null
          tipo?: string | null
        }
        Update: {
          cliente_id?: string
          contenido?: string
          creado_por?: string | null
          created_at?: string | null
          gimnasio_id?: string | null
          id?: string
          prioridad?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_medicas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_medicas_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_medicas_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          cliente_id: string
          concepto: string | null
          created_at: string | null
          factus_cufe: string | null
          factus_id: string | null
          factus_status: string | null
          factus_url: string | null
          fecha_pago: string | null
          gimnasio_id: string | null
          id: string
          iva_monto: number | null
          iva_porcentaje: number | null
          membresia_id: string | null
          metodo_pago: string | null
          monto: number
          recibo_numero: string | null
          registrado_por: string | null
          subtotal: number | null
          venta_id: string | null
        }
        Insert: {
          cliente_id: string
          concepto?: string | null
          created_at?: string | null
          factus_cufe?: string | null
          factus_id?: string | null
          factus_status?: string | null
          factus_url?: string | null
          fecha_pago?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_monto?: number | null
          iva_porcentaje?: number | null
          membresia_id?: string | null
          metodo_pago?: string | null
          monto: number
          recibo_numero?: string | null
          registrado_por?: string | null
          subtotal?: number | null
          venta_id?: string | null
        }
        Update: {
          cliente_id?: string
          concepto?: string | null
          created_at?: string | null
          factus_cufe?: string | null
          factus_id?: string | null
          factus_status?: string | null
          factus_url?: string | null
          fecha_pago?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_monto?: number | null
          iva_porcentaje?: number | null
          membresia_id?: string | null
          metodo_pago?: string | null
          monto?: number
          recibo_numero?: string | null
          registrado_por?: string | null
          subtotal?: number | null
          venta_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_membresia_id_fkey"
            columns: ["membresia_id"]
            isOneToOne: false
            referencedRelation: "membresias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagos_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          gimnasio_id: string | null
          id: string
          is_saas_admin: boolean | null
          nombre: string | null
          rol: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          gimnasio_id?: string | null
          id: string
          is_saas_admin?: boolean | null
          nombre?: string | null
          rol?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          gimnasio_id?: string | null
          id?: string
          is_saas_admin?: boolean | null
          nombre?: string | null
          rol?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfiles_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          activo: boolean | null
          aplica_iva: boolean | null
          created_at: string | null
          descripcion: string | null
          duracion_dias: number
          gimnasio_id: string | null
          id: string
          incluye_clases: boolean | null
          iva_porcentaje: number | null
          max_congelamiento_dias: number | null
          nombre: string
          precio: number
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          aplica_iva?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_dias?: number
          gimnasio_id?: string | null
          id?: string
          incluye_clases?: boolean | null
          iva_porcentaje?: number | null
          max_congelamiento_dias?: number | null
          nombre: string
          precio: number
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          aplica_iva?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          duracion_dias?: number
          gimnasio_id?: string | null
          id?: string
          incluye_clases?: boolean | null
          iva_porcentaje?: number | null
          max_congelamiento_dias?: number | null
          nombre?: string
          precio?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planes_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean | null
          aplica_iva: boolean | null
          categoria: string | null
          created_at: string | null
          fecha_vencimiento: string | null
          foto_url: string | null
          gimnasio_id: string | null
          id: string
          iva_porcentaje: number | null
          nombre: string
          precio_costo: number | null
          precio_venta: number
          proveedor: string | null
          sku: string | null
          stock: number | null
          stock_minimo: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          aplica_iva?: boolean | null
          categoria?: string | null
          created_at?: string | null
          fecha_vencimiento?: string | null
          foto_url?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_porcentaje?: number | null
          nombre: string
          precio_costo?: number | null
          precio_venta: number
          proveedor?: string | null
          sku?: string | null
          stock?: number | null
          stock_minimo?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          aplica_iva?: boolean | null
          categoria?: string | null
          created_at?: string | null
          fecha_vencimiento?: string | null
          foto_url?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_porcentaje?: number | null
          nombre?: string
          precio_costo?: number | null
          precio_venta?: number
          proveedor?: string | null
          sku?: string | null
          stock?: number | null
          stock_minimo?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      seriales: {
        Row: {
          created_at: string | null
          dias: number
          id: string
          serial: string
          usado: boolean | null
          usado_en: string | null
          usado_por_gimnasio_id: string | null
        }
        Insert: {
          created_at?: string | null
          dias: number
          id?: string
          serial: string
          usado?: boolean | null
          usado_en?: string | null
          usado_por_gimnasio_id?: string | null
        }
        Update: {
          created_at?: string | null
          dias?: number
          id?: string
          serial?: string
          usado?: boolean | null
          usado_en?: string | null
          usado_por_gimnasio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seriales_usado_por_gimnasio_id_fkey"
            columns: ["usado_por_gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
        ]
      }
      ventas: {
        Row: {
          cantidad: number | null
          cliente_id: string | null
          concepto: string | null
          created_at: string | null
          gimnasio_id: string | null
          id: string
          iva_monto: number | null
          iva_porcentaje: number | null
          metodo_pago: string | null
          precio_unitario: number | null
          producto_id: string
          subtotal: number | null
          total: number | null
          vendido_por: string | null
        }
        Insert: {
          cantidad?: number | null
          cliente_id?: string | null
          concepto?: string | null
          created_at?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_monto?: number | null
          iva_porcentaje?: number | null
          metodo_pago?: string | null
          precio_unitario?: number | null
          producto_id: string
          subtotal?: number | null
          total?: number | null
          vendido_por?: string | null
        }
        Update: {
          cantidad?: number | null
          cliente_id?: string | null
          concepto?: string | null
          created_at?: string | null
          gimnasio_id?: string | null
          id?: string
          iva_monto?: number | null
          iva_porcentaje?: number | null
          metodo_pago?: string | null
          precio_unitario?: number | null
          producto_id?: string
          subtotal?: number | null
          total?: number | null
          vendido_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_gimnasio_id_fkey"
            columns: ["gimnasio_id"]
            isOneToOne: false
            referencedRelation: "gimnasios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_vendido_por_fkey"
            columns: ["vendido_por"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role:
        | {
            Args: {
              p_assigned_by?: string
              p_expires_at?: string
              p_role_name: string
              p_user_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_assigned_by: string
              p_expires_at?: string
              p_role_name: string
              p_user_id: string
            }
            Returns: string
          }
      check_account_lockout: { Args: { p_email: string }; Returns: boolean }
      check_is_admin: { Args: never; Returns: boolean }
      check_is_saas_admin: { Args: never; Returns: boolean }
      check_licencia_activa: {
        Args: { p_gimnasio_id: string }
        Returns: boolean
      }
      check_permission: {
        Args: { p_action: string; p_resource: string; p_user_id: string }
        Returns: boolean
      }
      decrement_stock_producto: {
        Args: { p_cantidad: number; p_id: string }
        Returns: undefined
      }
      descontar_stock: {
        Args: { p_cantidad: number; p_id: string }
        Returns: undefined
      }
      find_gimnasio_by_name: { Args: { gym_name: string }; Returns: string }
      get_my_gym_id: { Args: never; Returns: string }
      increment_failed_attempts: {
        Args: { p_email: string; p_ip_address?: unknown }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      reset_failed_attempts: { Args: { p_email: string }; Returns: undefined }
      user_has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      degree_level:
        | "undergraduate"
        | "postgraduate"
        | "technical"
        | "technological"
      document_type: "CC" | "TI" | "CE" | "PAS"
      enrollment_status:
        | "active"
        | "inactive"
        | "graduated"
        | "withdrawn"
        | "probation"
      modality: "on-site" | "virtual" | "blended"
      period_type: "semester" | "quarter" | "inter-semester"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      degree_level: [
        "undergraduate",
        "postgraduate",
        "technical",
        "technological",
      ],
      document_type: ["CC", "TI", "CE", "PAS"],
      enrollment_status: [
        "active",
        "inactive",
        "graduated",
        "withdrawn",
        "probation",
      ],
      modality: ["on-site", "virtual", "blended"],
      period_type: ["semester", "quarter", "inter-semester"],
    },
  },
} as const
