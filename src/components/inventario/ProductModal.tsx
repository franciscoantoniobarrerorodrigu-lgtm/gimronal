'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { crearProducto, actualizarProducto } from "@/lib/supabase/actions"
import { Loader2, Camera, Upload, X, ImageIcon, Receipt } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto?: any
  onSuccess: () => void
}

export default function ProductModal({ open, onOpenChange, producto, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    stock: '0',
    stock_minimo: '5',
    precio_venta: '0',
    precio_costo: '0',
    sku: '',
    proveedor: '',
    fecha_vencimiento: '',
    foto_url: '',
    aplica_iva: false,
    iva_porcentaje: '19',
    activo: true
  })

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria || '',
        stock: String(producto.stock),
        stock_minimo: String(producto.stock_minimo || 5),
        precio_venta: String(producto.precio_venta),
        precio_costo: String(producto.precio_costo || 0),
        sku: producto.sku || '',
        proveedor: producto.proveedor || '',
        fecha_vencimiento: producto.fecha_vencimiento || '',
        foto_url: producto.foto_url || '',
        aplica_iva: producto.aplica_iva !== false,
        iva_porcentaje: String(producto.iva_porcentaje ?? 19),
        activo: producto.activo,
      });
      setImagePreview(producto.foto_url || null)
    } else {
      setFormData({
        nombre: '',
        categoria: '',
        stock: '0',
        stock_minimo: '5',
        precio_venta: '0',
        precio_costo: '0',
        sku: '',
        proveedor: '',
        fecha_vencimiento: '',
        foto_url: '',
        aplica_iva: false,
        iva_porcentaje: '19',
        activo: true,
      });
      setImagePreview(null)
    }
  }, [producto, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato no soportado. Usa JPG, PNG, WebP o GIF.')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB.')
      return
    }

    // Mostrar preview local inmediatamente
    const localPreview = URL.createObjectURL(file)
    setImagePreview(localPreview)

    setUploading(true)
    try {
      const supabase = createClient()
      
      // Generar nombre único
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
      const filePath = `productos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        toast.error('Error al subir: ' + uploadError.message)
        setImagePreview(formData.foto_url || null)
        return
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, foto_url: publicUrl }))
      setImagePreview(publicUrl)
      toast.success('Imagen subida correctamente')
    } catch (err: any) {
      toast.error('Error al subir imagen: ' + (err.message || 'Desconocido'))
      setImagePreview(formData.foto_url || null)
    } finally {
      setUploading(false)
      // Limpiar el input para permitir resubir el mismo archivo
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, foto_url: '' }))
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        nombre: formData.nombre,
        categoria: formData.categoria || null,
        stock: Number(formData.stock),
        stock_minimo: Number(formData.stock_minimo),
        precio_venta: Number(formData.precio_venta),
        precio_costo: Number(formData.precio_costo),
        sku: formData.sku || null,
        proveedor: formData.proveedor || null,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        foto_url: formData.foto_url || null,
        aplica_iva: formData.aplica_iva,
        iva_porcentaje: formData.aplica_iva ? (Number(formData.iva_porcentaje) || 19) : 0,
        activo: formData.activo,
      }

      if (producto) {
        const res = await actualizarProducto(producto.id, data)
        if (res.success) {
          toast.success("Producto actualizado")
        } else {
          toast.error("Error al actualizar: " + (res.error || 'Desconocido'))
          return
        }
      } else {
        const res = await crearProducto(data)
        if (res.success) {
          toast.success("Producto creado")
        } else {
          toast.error("Error al crear: " + (res.error || 'Desconocido'))
          return
        }
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-border/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-zinc-800 p-0">
        <div className="bg-gradient-to-br from-orange-500/10 to-transparent p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-2">
              <div className="w-2 h-8 bg-orange-600 rounded-full" />
              {producto ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          {/* FOTO DEL PRODUCTO */}
          <div className="space-y-2.5">
            <Label className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Foto del Producto</Label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-zinc-700 bg-zinc-900/50 flex items-center justify-center shrink-0 group">
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-700" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                )}
              </div>

              {/* Upload buttons */}
              <div className="flex flex-col gap-2 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 text-orange-500" />
                  {uploading ? 'Subiendo...' : 'Subir desde Archivo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start gap-2 h-10 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 text-xs"
                  onClick={() => {
                    // En móvil, input file con capture abre la cámara
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment')
                      fileInputRef.current.click()
                      // Remover capture después para que el siguiente clic normal funcione
                      setTimeout(() => fileInputRef.current?.removeAttribute('capture'), 100)
                    }
                  }}
                  disabled={uploading}
                >
                  <Camera className="w-4 h-4 text-orange-500" />
                  Tomar Foto
                </Button>
                <p className="text-[9px] text-zinc-600 ml-1">JPG, PNG, WebP o GIF · Máx 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label htmlFor="nombre" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Nombre del Producto</Label>
              <Input 
                id="nombre" 
                required 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Aguas Brisa"
                className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500/50 focus:ring-orange-500/20 h-12 text-zinc-100"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="sku" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">SKU / Código</Label>
              <Input 
                id="sku" 
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="Ej: BRISA-600"
                className="bg-zinc-900/50 border-zinc-800 h-12 text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label htmlFor="categoria" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Categoría</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(val) => setFormData({...formData, categoria: val || ''})}
              >
                <SelectTrigger id="categoria" className="bg-zinc-900/50 border-zinc-800 h-12 text-zinc-100">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <SelectItem value="Bebidas">Bebidas</SelectItem>
                  <SelectItem value="Suplementos">Suplementos</SelectItem>
                  <SelectItem value="Accesorios">Accesorios</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="Ropa">Ropa</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="proveedor" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Proveedor</Label>
              <Input 
                id="proveedor" 
                value={formData.proveedor}
                onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                placeholder="Nombre del proveedor"
                className="bg-zinc-900/50 border-zinc-800 h-12 text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-2.5">
              <Label htmlFor="stock" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Stock Actual</Label>
              <Input 
                id="stock" 
                type="number" 
                required 
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-12 font-black text-orange-500 text-lg"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="stock_minimo" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Aviso Bajo</Label>
              <Input 
                id="stock_minimo" 
                type="number" 
                required 
                value={formData.stock_minimo}
                onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-12 text-zinc-100 font-bold"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="fecha_vencimiento" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Vencimiento</Label>
              <Input 
                id="fecha_vencimiento" 
                type="date" 
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-12 text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label htmlFor="precio_costo" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Precio Costo ($)</Label>
              <Input 
                id="precio_costo" 
                type="number" 
                required 
                value={formData.precio_costo}
                onChange={(e) => setFormData({...formData, precio_costo: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-12 font-bold text-zinc-300"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="precio_venta" className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest ml-1">Precio Venta ($)</Label>
              <Input 
                id="precio_venta" 
                type="number" 
                required 
                value={formData.precio_venta}
                onChange={(e) => setFormData({...formData, precio_venta: e.target.value})}
                className="bg-zinc-900/50 border-zinc-800 h-12 font-black text-emerald-500 text-lg"
              />
            </div>
          </div>

          {/* IVA COLOMBIA */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500" />
                <Label className="text-amber-500 font-bold text-xs uppercase tracking-wider">Gestión Fiscal DIAN (IVA 19%)</Label>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, aplica_iva: !formData.aplica_iva})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${formData.aplica_iva ? 'bg-amber-500' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${formData.aplica_iva ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div className="text-[11px] text-zinc-400 leading-relaxed space-y-2">
              {formData.aplica_iva ? (
                <div className="space-y-1 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-amber-400">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>✅ Modalidad Responsable de IVA</span>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Aplica y desglosa el 19% de IVA sobre el precio base para declararlo ante la DIAN en la facturación electrónica.
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20 mt-2">
                    <span className="text-[10px] text-amber-500/80 font-bold">Precio Total al Cliente (con IVA):</span>
                    <span className="text-sm font-black text-amber-500">
                      $ {Math.round(Number(formData.precio_venta || 0) * 1.19).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-emerald-400">
                  <p className="font-bold flex items-center gap-1.5">
                    <span>❌ No Responsable de IVA (RUT 49) — Precio Neto</span>
                  </p>
                  <p className="text-[10px] text-zinc-300 leading-normal">
                    El cliente paga exactamente el Precio de Venta fijado ($ {Number(formData.precio_venta || 0).toLocaleString('es-CO')}). El IVA pagado a tu proveedor (ej. Olímpica) ya va incluido en tu Precio Costo. Es un ingreso neto comercial para tu caja.
                  </p>
                  <p className="text-[10px] text-emerald-500/90 font-medium border-t border-emerald-500/20 pt-1.5 mt-1.5">
                    ⚠️ <span className="font-bold">Tope DIAN 2026:</span> Recuerda que la suma mensual de Mensualidades + Tienda no debe superar ~$15.200.000 COP mensual (3.500 UVT anuales) para mantener este beneficio.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-row gap-3 sm:justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none text-zinc-500"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading} 
              className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white font-black uppercase italic tracking-tighter"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {producto ? 'Actualizar' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
