'use client'

import { useState, useRef } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { useQueryState } from 'nuqs'
import { getInventarioDashboard, eliminarProductoAction, actualizarProductoAction } from '@/lib/supabase/actions/inventario'
import { getCajaActiva } from '@/lib/supabase/actions/caja'
import { showPremiumToast } from '@/lib/notifications'
import { generateReportPDF } from '@/lib/pdf-utils'
import { formatCOP } from '@/lib/format-utils'

/**
 * Hook personalizado que encapsula toda la lógica de negocio del módulo de Inventario.
 * Separa estado, filtrado, ordenamiento, y operaciones CRUD del componente de UI.
 */
export function useInventario(initialData: any, initialCajaAbierta: boolean) {
  // --- Estado ---
  const [loading, setLoading] = useState(false)
  const [productos, setProductos] = useState<any[]>(initialData.productos || [])
  const [stats, setStats] = useState(initialData.stats || { stockBajo: 0, valorTotal: 0, ventasMes: 0, ventasPorProducto: [] as any[] })
  
  const [busqueda, setBusqueda] = useQueryState('search', { defaultValue: '' })
  const [categoriaFiltro, setCategoriaFiltro] = useQueryState('categoria', { defaultValue: 'Todos' })
  
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [isVentaModalOpen, setIsVentaModalOpen] = useState(false)
  const [productoVenta, setProductoVenta] = useState<any>(null)
  const [isMovimientosModalOpen, setIsMovimientosModalOpen] = useState(false)
  const [isCajaAbierta, setIsCajaAbierta] = useState(initialCajaAbierta)
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [editingPriceValue, setEditingPriceValue] = useState('')
  const priceInputRef = useRef<HTMLInputElement>(null)

  // --- Operaciones de datos ---
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

  // --- Actions ---
  const { execute: executeDelete } = useAction(eliminarProductoAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        showPremiumToast.success('Producto Eliminado', 'El producto ha sido removido del catálogo permanentemente.')
        cargarDatos()
      }
    },
    onError: ({ error }) => {
      showPremiumToast.error('No se pudo eliminar', error.serverError || 'Error al intentar eliminar')
    }
  })

  const { execute: executeUpdatePrice, isExecuting: isUpdatingPrice } = useAction(actualizarProductoAction, {
    onSuccess: ({ data }) => {
      if (data) {
        showPremiumToast.success('Producto Actualizado', 'El precio se ha guardado correctamente')
        setProductos(prev => prev.map(p => p.id === data.id ? { ...p, precio_venta: data.precio_venta } : p))
        setEditingPriceId(null)
        setEditingPriceValue('')
      }
    },
    onError: ({ error }) => {
      showPremiumToast.error('Error al Actualizar', error.serverError || 'No se pudo actualizar el producto')
      setEditingPriceId(null)
      setEditingPriceValue('')
    }
  })

  // --- Handlers ---
  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    executeDelete({ id })
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
    executeUpdatePrice({ id: productoId, updates: { precio_venta: newPrice } })
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

  // --- Datos derivados ---
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

  const categorias = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))]

  return {
    // Estado
    loading,
    productos,
    stats,
    busqueda,
    setBusqueda,
    categoriaFiltro,
    setCategoriaFiltro,
    sortConfig,
    isModalOpen,
    setIsModalOpen,
    productoSeleccionado,
    setProductoSeleccionado,
    isVentaModalOpen,
    setIsVentaModalOpen,
    productoVenta,
    setProductoVenta,
    isMovimientosModalOpen,
    setIsMovimientosModalOpen,
    isCajaAbierta,
    editingPriceId,
    editingPriceValue,
    setEditingPriceValue,
    priceInputRef,
    isUpdatingPrice,

    // Datos derivados
    productosFiltrados,
    categorias,

    // Handlers
    cargarDatos,
    handleEliminar,
    handleEditar,
    handleNuevo,
    startEditingPrice,
    cancelEditingPrice,
    savePrice,
    handleVender,
    handleSort,
    handleExport,
    getVencimientoColor,
  }
}
