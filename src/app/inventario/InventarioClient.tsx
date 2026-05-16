'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Search, 
  ShoppingCart,
  ArrowRightLeft,
  MoreVertical,
  Dumbbell,
  PackageSearch,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  TrendingUp,
  Tag,
  Truck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getInventarioDashboard, eliminarProducto, actualizarProducto } from '@/lib/supabase/actions/inventario'
import { getCajaActiva } from '@/lib/supabase/actions/caja'
import { showPremiumToast } from '@/lib/notifications'
import { toast } from 'sonner'
import ProductModal from '@/components/inventario/ProductModal'
import { VentaModal } from '@/components/inventario/VentaModal'
import MovimientosInventarioModal from '@/components/inventario/MovimientosInventarioModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Trash2, Pencil, Check, X } from 'lucide-react'
import { generateReportPDF } from '@/lib/pdf-utils'
import { formatCOP } from '@/lib/format-utils'

import { SectionHeader } from '@/components/shared/SectionHeader'
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false })
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false })

export default function InventarioClient({ 
  initialData, 
  initialCajaAbierta 
}: { 
  initialData: any, 
  initialCajaAbierta: boolean 
}) {
  const [loading, setLoading] = useState(false)
  const [productos, setProductos] = useState<any[]>(initialData.productos || [])
  const [stats, setStats] = useState(initialData.stats || { stockBajo: 0, valorTotal: 0, ventasMes: 0, ventasPorProducto: [] as any[] })
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false)
  const [productoVenta, setProductoVenta] = useState<any>(null)
  const [isMovimientosModalOpen, setIsMovimientosModalOpen] = useState(false)
  const [isCajaAbierta, setIsCajaAbierta] = useState(initialCajaAbierta)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState('')
  const [savingPrice, setSavingPrice] = useState(false)
  const priceInputRef = useRef<HTMLInputElement>(null)

  const checkCaja = async () => {
    const caja = await getCajaActiva()
    setIsCajaAbierta(!!caja)
  }

  const cargarDatos = async () => {
    setLoading(true)
    const res = await getInventarioDashboard()
    if (res.success && res.data) {
      setProductos(res.data.productos)
      setStats(res.data.stats)
    } else {
      showPremiumToast.error('Error de Carga', res.error || 'No se pudo cargar el inventario')
    }
    setLoading(false)
    checkCaja()
  }

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    
    try {
      const res = await eliminarProducto(id)
      if (res.success) {
        showPremiumToast.success('Producto Eliminado', 'El producto ha sido removido del catálogo permanentemente.')
        cargarDatos()
      } else {
        showPremiumToast.error('No se pudo eliminar', res.error)
      }
    } catch (err) {
      showPremiumToast.error('Error de Comunicación', 'Hubo un problema al intentar procesar la eliminación.')
    }
  }

  const handleEditar = (producto: any) => {
    setProductoSeleccionado(producto)
    setIsModalOpen(true)
  }

  const handleNuevo = () => {
    setProductoSeleccionado(null)
    setIsModalOpen(true)
  }

  const startEditingPrice = (producto: any) => {
    setEditingPriceId(producto.id)
    setEditingPriceValue(String(producto.precio_venta || 0))
    setTimeout(() => priceInputRef.current?.focus(), 50)
  }

  const cancelEditingPrice = () => {
    setEditingPriceId(null)
    setEditingPriceValue('')
  }

  const savePrice = async (productoId: string) => {
    const newPrice = Number(editingPriceValue)
    if (isNaN(newPrice) || newPrice < 0) {
      showPremiumToast.warning('Precio Inválido', 'Por favor ingresa un valor numérico correcto')
      return
    }
    setSavingPrice(true)
    try {
      const res = await actualizarProducto(productoId, { precio_venta: newPrice })
      if (res.success) {
        showPremiumToast.success('Producto Actualizado', 'El precio se ha guardado correctamente')
        setProductos(prev => prev.map(p => p.id === productoId ? { ...p, precio_venta: newPrice } : p))
      } else {
        showPremiumToast.error('Error al Actualizar', res.error)
      }
    } catch {
      showPremiumToast.error('Error Inesperado', 'No se pudo actualizar el producto')
    } finally {
      setSavingPrice(false)
      setEditingPriceId(null)
      setEditingPriceValue('')
    }
  }

  const handleVender = async (producto: any) => {
    const caja = await getCajaActiva()
    if (!caja) {
      showPremiumToast.warning('Acción Bloqueada', 'Debes abrir una sesión de caja antes de poder vender productos.')
      setIsCajaAbierta(false)
      return
    }
    setIsCajaAbierta(true)
    setProductoVenta(producto)
    setIsVentaModalOpen(true)
  }

  const handleSort = (key: string) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleExport = () => {
    const columns = ['SKU', 'Producto', 'Categoría', 'Stock', 'P. Costo', 'P. Venta', 'Margen', 'Proveedor', 'Vencimiento']
    const data = productosFiltrados.map(p => [
      p.sku || 'N/A',
      p.nombre,
      p.categoria || 'Sin Cat.',
      p.stock,
      formatCOP(p.precio_costo || 0),
      formatCOP(p.precio_venta || 0),
      `${p.precio_venta > 0 ? Math.round(((p.precio_venta - (p.precio_costo || 0)) / p.precio_venta) * 100) : 0}%`,
      p.proveedor || 'N/A',
      p.fecha_vencimiento || 'N/A'
    ])
    generateReportPDF('Inventario de Productos', columns, data)
  }


  const productosFiltrados = productos
    .filter(p => {
      const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           (p.sku?.toLowerCase().includes(busqueda.toLowerCase())) ||
                           (p.categoria?.toLowerCase().includes(busqueda.toLowerCase()))
      const matchCategoria = categoriaFiltro === 'Todos' || p.categoria === categoriaFiltro
      return matchBusqueda && matchCategoria
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key] || ''
      const bValue = b[sortConfig.key] || ''
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })

  const getVencimientoColor = (fecha: string) => {
    if (!fecha) return ''
    const hoy = new Date()
    const venc = new Date(fecha)
    const diffTime = venc.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'text-red-500 font-black'
    if (diffDays <= 15) return 'text-orange-500 font-bold'
    return ''
  }

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-20 animate-in-fade">
      <SectionHeader 
        title="Inventario y Tienda" 
        subtitle="Control de stock y ventas de suplementos y accesorios en tiempo real."
      >
        <Button 
          variant="outline" 
          className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
          onClick={handleExport}
        >
          <Download className="size-4 mr-2" />
          Exportar PDF
        </Button>
        <Button 
          variant="outline" 
          className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10"
          onClick={() => setIsMovimientosModalOpen(true)}
        >
          <ArrowRightLeft className="size-4 mr-2" />
          Movimientos
        </Button>
        <Button 
          className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          onClick={handleNuevo}
        >
          <Plus className="size-4 mr-2" />
          Nuevo Producto
        </Button>
      </SectionHeader>

      {/* STATS & CHART */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1 grid gap-4">
          <Card className="glass-card bg-orange-500/5 border-orange-500/10 hover:bg-orange-500/10 transition-all">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-orange-500/80">Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <div>
                <div className="text-xl md:text-2xl font-black text-orange-500">
                  {loading ? <Dumbbell className="w-5 h-5 animate-spin" /> : `${stats.stockBajo}`}
                </div>
                <p className="text-[10px] text-orange-600/60 mt-1">Prod. por agotarse</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-orange-600/30" />
            </CardContent>
          </Card>

          <Card className="glass-card bg-primary/5 border-primary/10 hover:bg-primary/10 transition-all">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Ventas del Mes</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex items-center justify-between">
              <div>
                <div className="text-xl md:text-2xl font-black text-primary">
                  {loading ? <Dumbbell className="w-5 h-5 animate-spin" /> : formatCOP(stats.ventasMes)}
                </div>
                <p className="text-[10px] text-primary/60 mt-1">Ingresos actuales</p>
              </div>
              <ShoppingCart className="w-6 h-6 text-primary/20" />
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card md:col-span-3 border-white/5 overflow-hidden">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rendimiento por Producto</CardTitle>
              <p className="text-[10px] text-muted-foreground/60 italic">Top 5 productos con más ventas este mes</p>
            </div>
            <TrendingUp className="size-4 text-primary/40" />
          </CardHeader>
          <CardContent className="p-4 h-40">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell className="w-6 h-6 animate-spin text-muted-foreground/20" />
              </div>
            ) : stats.ventasPorProducto.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ventasPorProducto} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="nombre" 
                    type="category" 
                    width={100} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-black/80 border border-white/10 p-2 rounded-lg backdrop-blur-md shadow-2xl">
                            <p className="text-[10px] font-black text-white uppercase">{payload[0].payload.nombre}</p>
                            <p className="text-sm font-black text-primary">{formatCOP(payload[0].value as number)}</p>
                            <p className="text-[9px] text-muted-foreground italic">{payload[0].payload.cantidad} unidades vendidas</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#ff5a00"
                    radius={[0, 4, 4, 0]} 
                    barSize={20} 
                    minPointSize={10}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                <Package className="w-8 h-8 mb-2" />
                <p className="text-xs font-bold uppercase tracking-tighter">Sin datos de ventas aún</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['Todos', 'Bebidas', 'Suplementos', 'Accesorios', 'Snacks', 'Ropa'].map((cat) => (
            <Button
              key={cat}
              variant={categoriaFiltro === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoriaFiltro(cat)}
              className={cn(
                "rounded-full px-4 h-8 text-[10px] font-bold uppercase tracking-widest transition-all",
                categoriaFiltro === cat 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
                  : "border-white/5 bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              {cat === 'Todos' ? <Filter className="w-3 h-3 mr-2" /> : <Tag className="w-3 h-3 mr-2" />}
              {cat}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por nombre, SKU o categoría..." 
            className="pl-10 bg-white/5 border-white/5 focus:border-primary/30 focus:ring-primary/20 transition-all rounded-full h-10 text-xs"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>
        
      <div className="glass-card border-white/5 overflow-hidden">
        {/* Vista Desktop - Tabla */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="w-[300px]">
                  <Button variant="ghost" className="p-0 hover:bg-transparent text-[10px] font-bold uppercase tracking-widest text-muted-foreground" onClick={() => handleSort('nombre')}>
                    Producto <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent text-[10px] font-bold uppercase tracking-widest text-muted-foreground" onClick={() => handleSort('categoria')}>
                    Categoría <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent text-[10px] font-bold uppercase tracking-widest text-muted-foreground" onClick={() => handleSort('stock')}>
                    Stock <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 hover:bg-transparent text-[10px] font-bold uppercase tracking-widest text-muted-foreground" onClick={() => handleSort('precio_costo')}>
                    Costo <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 hover:bg-transparent text-[10px] font-bold uppercase tracking-widest text-muted-foreground" onClick={() => handleSort('precio_venta')}>
                    Venta <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Margen</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent text-[10px] font-bold uppercase tracking-widest text-muted-foreground" onClick={() => handleSort('fecha_vencimiento')}>
                    Vencimiento <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <Dumbbell className="w-8 h-8 animate-spin mx-auto text-primary/50" />
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Cargando inventario...</p>
                  </TableCell>
                </TableRow>
              ) : productosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <PackageSearch className="w-10 h-10 mx-auto text-muted-foreground/30" />
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">No se encontraron productos</p>
                  </TableCell>
                </TableRow>
              ) : (
                productosFiltrados.map((item) => {
                  const margen = item.precio_venta > 0 
                    ? Math.round(((item.precio_venta - (item.precio_costo || 0)) / item.precio_venta) * 100) 
                    : 0
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-white/[0.02] border-white/5 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.foto_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                              <img src={item.foto_url} alt={item.nombre} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0 border border-dashed border-white/10">
                              <Package className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{item.nombre}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" /> {item.sku || 'SIN SKU'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-bold text-[9px] uppercase bg-white/5 border-white/10 text-muted-foreground">
                          {item.categoria || 'S/C'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className={cn(
                            "text-sm font-black flex items-center gap-2",
                            item.stock <= (item.stock_minimo || 5) ? "text-orange-500" : "text-white"
                          )}>
                            {item.stock} 
                            {item.stock <= (item.stock_minimo || 5) && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all",
                                  item.stock <= (item.stock_minimo || 5) ? "bg-orange-500" : "bg-emerald-500"
                                )} 
                                style={{ width: `${Math.min((item.stock / (item.stock_minimo || 5)) * 50, 100)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground font-bold italic">Mín: {item.stock_minimo || 5}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground/60 text-xs">
                        {formatCOP(item.precio_costo || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs text-muted-foreground">$</span>
                            <input
                              ref={priceInputRef}
                              type="number"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') savePrice(item.id)
                                if (e.key === 'Escape') cancelEditingPrice()
                              }}
                              className="w-24 bg-zinc-900 border border-primary/50 rounded-md px-2 py-1 text-sm font-black text-primary text-right outline-none focus:ring-2 focus:ring-primary/30"
                              disabled={savingPrice}
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => savePrice(item.id)}
                              disabled={savingPrice}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-500 hover:bg-zinc-800"
                              onClick={cancelEditingPrice}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingPrice(item)}
                            className="inline-flex items-center gap-1.5 font-black text-primary text-sm hover:bg-primary/10 px-2 py-1 rounded-md transition-colors group/price cursor-pointer"
                            title="Clic para editar precio"
                          >
                            {formatCOP(item.precio_venta)}
                            {item.aplica_iva !== false && (
                              <Badge className="ml-1 bg-amber-500/15 text-amber-500 border-amber-500/30 text-[8px] font-black px-1 py-0 h-4">
                                IVA
                              </Badge>
                            )}
                            <Pencil className="w-3 h-3 opacity-0 group-hover/price:opacity-100 transition-opacity text-primary/60" />
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] font-black border-none",
                            margen > 30 ? "bg-emerald-500/10 text-emerald-500" : 
                            margen > 15 ? "bg-blue-500/10 text-blue-500" : 
                            "bg-orange-500/10 text-orange-500"
                          )}
                        >
                          {margen}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-bold flex items-center gap-1", getVencimientoColor(item.fecha_vencimiento))}>
                            {item.fecha_vencimiento ? (
                              <>
                                <Calendar className="w-3 h-3" />
                                {new Date(item.fecha_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </>
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </span>
                          {item.proveedor && (
                            <span className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Truck className="w-2.5 h-2.5" /> {item.proveedor}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 font-bold text-[10px] uppercase"
                            onClick={() => handleVender(item)}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            Venta
                          </Button>
                          <ProductActions 
                            item={item} 
                            handleVender={handleVender} 
                            handleEditar={handleEditar} 
                            handleEliminar={handleEliminar} 
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Vista Mobile - Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-12 text-center">
              <Dumbbell className="w-8 h-8 animate-spin mx-auto text-primary/50" />
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
              No hay productos.
            </div>
          ) : (
            productosFiltrados.map((item) => (
              <div key={item.id} className="p-4 flex flex-col gap-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0">
                    {item.foto_url ? (
                      <div className="size-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                        <img src={item.foto_url} alt={item.nombre} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="size-12 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0 border border-dashed border-white/10">
                        <Package className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">{item.nombre}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-[8px] px-1 h-3.5 bg-white/5 border-white/10 uppercase font-bold text-muted-foreground">
                          {item.categoria || 'S/C'}
                        </Badge>
                        {item.sku && (
                          <span className="text-[8px] text-muted-foreground/60 font-medium uppercase tracking-tighter self-center">
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ProductActions 
                    item={item} 
                    handleVender={handleVender} 
                    handleEditar={handleEditar} 
                    handleEliminar={handleEliminar} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Stock</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-black",
                        item.stock <= (item.stock_minimo || 5) ? "text-orange-500" : "text-white"
                      )}>
                        {item.stock} un.
                      </span>
                      {item.stock <= (item.stock_minimo || 5) && <AlertTriangle className="w-3 h-3 text-orange-500 animate-pulse" />}
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Precio</p>
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-sm font-black text-primary">{formatCOP(item.precio_venta)}</p>
                      {item.aplica_iva !== false && (
                        <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[7px] font-black px-1 py-0 h-3.5">
                          IVA
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.fecha_vencimiento && (
                    <div className="col-span-2 mt-1 pt-1 border-t border-white/5 flex items-center justify-between">
                      <p className="text-[8px] uppercase font-black text-muted-foreground tracking-widest">Vencimiento</p>
                      <span className={cn("text-[10px] font-bold flex items-center gap-1", getVencimientoColor(item.fecha_vencimiento))}>
                        <Calendar className="w-3 h-3" />
                        {new Date(item.fecha_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all h-9 text-xs font-black uppercase tracking-widest"
                  onClick={() => handleVender(item)}
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Venta Rápida
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <ProductModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        producto={productoSeleccionado}
        onSuccess={cargarDatos}
      />

      <VentaModal 
        open={isVentaModalOpen} 
        onOpenChange={setIsVentaModalOpen} 
        producto={productoVenta}
        onSuccess={cargarDatos}
      />

      <MovimientosInventarioModal 
        open={isMovimientosModalOpen} 
        onOpenChange={setIsMovimientosModalOpen} 
      />
    </div>
  )
}

function ProductActions({ item, handleVender, handleEditar, handleEliminar }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleEditar(item)}>
          <Edit className="size-4 mr-2" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleEliminar(item.id)} 
          className="text-rose-500 focus:text-rose-500"
        >
          <Trash2 className="size-4 mr-2" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
