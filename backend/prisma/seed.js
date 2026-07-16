import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hash(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const [admin, vendedor, contador] = await Promise.all([
    prisma.usuario.upsert({
      where: { correo: "admin@grainstore.com" },
      update: {},
      create: {
        nombre: "Administrador",
        correo: "admin@grainstore.com",
        passwordHash: await hash("admin123"),
        rol: "admin",
        estado: "Activo",
        telefono: "300 123 4567",
      },
    }),
    prisma.usuario.upsert({
      where: { correo: "vendedor@grainstore.com" },
      update: {},
      create: {
        nombre: "Vendedor",
        correo: "vendedor@grainstore.com",
        passwordHash: await hash("vendedor123"),
        rol: "vendedor",
        estado: "Activo",
        telefono: "300 123 4567",
      },
    }),
    prisma.usuario.upsert({
      where: { correo: "contador@grainstore.com" },
      update: {},
      create: {
        nombre: "Contador",
        correo: "contador@grainstore.com",
        passwordHash: await hash("contador123"),
        rol: "contador",
        estado: "Activo",
        telefono: "300 123 4567",
      },
    }),
  ]);

  const clientesData = [
    { documento: "900123456-1", nombre: "Mercado El Trigal", telefono: "300 123 4567", correo: "compras@eltrigal.com", direccion: "Cra 5 #12-34, Ibagué", tipo: "Mayorista", estado: "Activo" },
    { documento: "1056123456", nombre: "Tienda San Jose", telefono: "310 555 9012", correo: "sanjose@correo.com", direccion: "Calle 18 #7-45, Ibagué", tipo: "Minorista", estado: "Activo" },
    { documento: "901777888-4", nombre: "Distribuidora La Cosecha", telefono: "318 222 3344", correo: "admin@lacosecha.com", direccion: "Av. Ambalá #42-10, Ibagué", tipo: "Mayorista", estado: "Pendiente" },
    { documento: "79999000", nombre: "Granero Central", telefono: "322 444 7788", correo: "contacto@granerocentral.com", direccion: "Cl. 10 #3-28, Espinal", tipo: "Minorista", estado: "Inactivo" },
  ];

  const clientes = [];
  for (const data of clientesData) {
    clientes.push(
      await prisma.cliente.upsert({ where: { documento: data.documento }, update: {}, create: data }),
    );
  }

  const productosData = [
    { codigo: "ARR-001", nombre: "Arroz Diana", categoria: "Arroz", stock: 48, stockMinimo: 10, precio: 4200 },
    { codigo: "FRJ-002", nombre: "Frijol Cargamanto", categoria: "Frijol", stock: 8, stockMinimo: 12, precio: 7800 },
    { codigo: "LEN-003", nombre: "Lenteja Nacional", categoria: "Lenteja", stock: 40, stockMinimo: 8, precio: 5600 },
    { codigo: "MAI-004", nombre: "Maíz Petado", categoria: "Maíz", stock: 35, stockMinimo: 10, precio: 3900 },
  ];

  const productos = [];
  for (const data of productosData) {
    productos.push(
      await prisma.producto.upsert({ where: { codigo: data.codigo }, update: {}, create: data }),
    );
  }

  const [arroz, frijol, lenteja, maiz] = productos;
  const [trigal, sanJose, cosecha] = clientes;

  const ventasData = [
    {
      codigo: "VEN-001",
      clienteId: trigal.id,
      usuarioId: vendedor.id,
      fecha: new Date("2026-06-24"),
      metodoPago: "Contado",
      estado: "Pagada",
      items: [
        { productoId: arroz.id, cantidad: 30, precioUnitario: 4200 },
        { productoId: frijol.id, cantidad: 16, precioUnitario: 7800 },
      ],
    },
    {
      codigo: "VEN-002",
      clienteId: sanJose.id,
      usuarioId: vendedor.id,
      fecha: new Date("2026-06-24"),
      metodoPago: "Crédito",
      estado: "Pendiente",
      items: [
        { productoId: lenteja.id, cantidad: 20, precioUnitario: 5600 },
        { productoId: maiz.id, cantidad: 19, precioUnitario: 3900 },
      ],
    },
    {
      codigo: "VEN-003",
      clienteId: cosecha.id,
      usuarioId: admin.id,
      fecha: new Date("2026-06-23"),
      metodoPago: "Contado",
      estado: "Pagada",
      items: [
        { productoId: arroz.id, cantidad: 80, precioUnitario: 4200 },
        { productoId: frijol.id, cantidad: 35, precioUnitario: 7800 },
      ],
    },
  ];

  for (const venta of ventasData) {
    const existing = await prisma.venta.findUnique({ where: { codigo: venta.codigo } });
    if (existing) continue;

    const total = venta.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);
    await prisma.venta.create({
      data: {
        codigo: venta.codigo,
        clienteId: venta.clienteId,
        usuarioId: venta.usuarioId,
        fecha: venta.fecha,
        metodoPago: venta.metodoPago,
        estado: venta.estado,
        total,
        items: { create: venta.items },
      },
    });
  }

  const egresosData = [
    { codigo: "EGR-001", fecha: new Date("2026-06-24"), categoria: "Compra de mercancía", descripcion: "Compra de arroz y frijol para inventario", valor: 3250000, usuarioId: admin.id },
    { codigo: "EGR-002", fecha: new Date("2026-06-23"), categoria: "Transporte", descripcion: "Flete proveedor regional", valor: 420000, usuarioId: vendedor.id },
    { codigo: "EGR-003", fecha: new Date("2026-06-22"), categoria: "Servicios", descripcion: "Servicios públicos del local", valor: 680000, usuarioId: contador.id },
  ];

  for (const egreso of egresosData) {
    await prisma.egreso.upsert({ where: { codigo: egreso.codigo }, update: {}, create: egreso });
  }

  await prisma.configuracionTienda.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: "Grain Store",
      nit: "900123456-1",
      direccion: "Cra 5 #12-34, Ibagué",
      telefono: "300 123 4567",
      correo: "contacto@grainstore.com",
      moneda: "COP",
      densidadDashboard: "Cómoda",
      alertaStockBajo: "10 unidades",
      modoVisual: "Claro / Oscuro",
    },
  });

  console.log("Seed completado: usuarios, clientes, productos, ventas, egresos y configuración.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
