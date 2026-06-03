'use client'

import React from 'react'
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
import { formatCOP } from '@/lib/format-utils'
import { SectionHeader } from '@/components/shared/SectionHeader'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useInventario } from './useInventario'

const InventarioChart = dynamic(() => import('@/components/inventario/InventarioChart'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">Cargando gráfico...</div>
})

export default function InventarioClient({ 
  initialData, 
  initialCajaAbierta 
}: { 
  initialData: any, 
  initialCajaAbierta: boolean 
}) {
  const inv = useInventario(initialData, initialCajaAbierta)

  // Desestructurar para compatibilidad con el JSX existente
  const {
    loading, stats, busqueda, setBusqueda, categoriaFiltro, setCategoriaFiltro,
    sortConfig, isModalOpen, setIsModalOpen, productoSeleccionado,
    isVentaModalOpen, setIsVentaModalOpen, productoVenta,
    isMovimientosModalOpen, setIsMovimientosModalOpen,
    editingPriceId, editingPriceValue, setEditingPriceValue, priceInputRef, isUpdatingPrice,
    productosFiltrados,
    cargarDatos, handleEliminar, handleEditar, handleNuevo,
    startEditingPrice, cancelEditingPrice, savePrice,
    handleVender, handleSort, handleExport, getVencimientoColor,
  } = inv
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
              <InventarioChart data={stats.ventasPorProducto} />
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
              variant={categoriaFiltro === cat ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setCategoriaFiltro(cat)}
              className={cn(
                "rounded-full px-4 h-8 text-[10px] font-bold uppercase tracking-widest transition-all",
                categoriaFiltro === cat 
                  ? "bg-white/15 text-white border-white/20 shadow-sm scale-105" 
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
            value={busqueda || ''}
            onChange={(e) => setBusqueda(e.target.value || null)}
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
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 relative">
                              <Image src={item.foto_url} alt={item.nombre} fill className="object-cover" sizes="40px" />
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
                              disabled={isUpdatingPrice}
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-emerald-500 hover:bg-emerald-500/10"
                              onClick={() => savePrice(item.id)}
                              disabled={isUpdatingPrice}
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
                            {item.aplica_iva === true && (
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
                      <div className="size-12 rounded-lg overflow-hidden border border-white/10 shrink-0 relative">
                        <Image src={item.foto_url} alt={item.nombre} fill className="object-cover" sizes="48px" />
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
                      {item.aplica_iva === true && (
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
