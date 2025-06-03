import { ActionFunctionArgs, Link, useLoaderData } from "react-router-dom";
import { getProducts, updateProductAvailability } from "../services/ProductService";
import ProductDetails from "../components/ProductDetails";
import { Product } from "../types";

// Importaciones para PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function loader() {
    const products = await getProducts();
    return products ?? [];
}

export async function action({ request }: ActionFunctionArgs) {
    const data = Object.fromEntries(await request.formData());
    await updateProductAvailability(+data.id);
    return {};
}

export default function Products() {
    const products = useLoaderData() as Product[];
    if (!products || !Array.isArray(products)) {
        return <p>Cargando o sin productos...</p>;
    }

    // Función para exportar PDF
    const handleExportPDF = () => {
    const doc = new jsPDF();
    console.log("Botón presionado");

    doc.setFontSize(18);
    doc.text("Listado de Productos", 14, 22);

    const fecha = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Fecha de exportación: ${fecha}`, 14, 30);

    const headers = [["Producto", "Precio", "Disponibilidad"]];
    const data = products.map(prod => {
        const precioFormateado = typeof prod.price === 'number' && !isNaN(prod.price)
            ? prod.price.toFixed(2)
            : '0.00';
        return [
            prod.name,
            `$${precioFormateado}`,
            prod.availability ? "Disponible" : "No disponible"
        ];
    });

    autoTable(doc, {
        startY: 40,
        head: headers,
        body: data,
        styles: { fontSize: 11 },
        theme: "grid",
    });

    doc.save("productos.pdf");
};
    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-slate-500">Productos</h2>

                <div className="flex gap-4">
                    <button
                        onClick={handleExportPDF}
                        className="rounded-md bg-purple-600 p-3 text-sm font-bold text-white shadow-sm hover:bg-purple-500"
                    >
                        Exportar a PDF
                    </button>

                    <Link
                        to="productos/nuevo"
                        className="rounded-md bg-indigo-600 p-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Agregar Producto
                    </Link>
                </div>
            </div>

            <div className="p-2">
                <table className="w-full mt-5 table-auto">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="p-2">Producto</th>
                            <th className="p-2">Precio</th>
                            <th className="p-2">Disponibilidad</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <ProductDetails
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

