import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import {
  allocateProductsToSections,
  ensureNoProductDuplicateAcrossSections,
} from "@/lib/productAllocationAlgorithm";
=======
import { allocateProductsToSections, ensureNoProductDuplicateAcrossSections } from "@/lib/productAllocationAlgorithm";
>>>>>>> 2f2bb25 (Done)

interface Product {
  _id?: string;
  pid?: string;
  id?: string;
  [key: string]: unknown;
}

interface AllocationRequest {
  products: Product[];
  showNew?: boolean;
  rotationIndex?: number;
}

/**
 * POST /api/products/allocate
 * Allocates products to Platinum, Gold, Silver, and Discounted sections
 * Ensures no product appears in multiple sections
 */
export async function POST(request: NextRequest) {
  try {
    const body: AllocationRequest = await request.json();
    const { products = [] } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        {
          platinum: [],
          gold: [],
          silver: [],
          discounted: [],
          unallocated: [],
          message: "No products provided",
        },
<<<<<<< HEAD
        { status: 200 },
=======
        { status: 200 }
>>>>>>> 2f2bb25 (Done)
      );
    }

    // Allocate products to sections
    const allocation = allocateProductsToSections(products);

    // Get the allocated products
    const allocationDetails = {
      platinum: products.filter((p) => {
        const id = p._id || p.pid || p.id;
        return id && allocation.platinum.includes(id);
      }),
      gold: products.filter((p) => {
        const id = p._id || p.pid || p.id;
        return id && allocation.gold.includes(id);
      }),
      silver: products.filter((p) => {
        const id = p._id || p.pid || p.id;
        return id && allocation.silver.includes(id);
      }),
      discounted: products.filter((p) => {
        const id = p._id || p.pid || p.id;
        return id && allocation.discounted.includes(id);
      }),
    };

    // Ensure no duplicates across sections
    const deduplicated = ensureNoProductDuplicateAcrossSections(
      allocationDetails.platinum,
      allocationDetails.gold,
      allocationDetails.silver,
<<<<<<< HEAD
      allocationDetails.discounted,
=======
      allocationDetails.discounted
>>>>>>> 2f2bb25 (Done)
    );

    return NextResponse.json(
      {
        success: true,
        sections: {
          platinum: {
            count: deduplicated.platinum.length,
            products: deduplicated.platinum,
          },
          gold: {
            count: deduplicated.gold.length,
            products: deduplicated.gold,
          },
          silver: {
            count: deduplicated.silver.length,
            products: deduplicated.silver,
          },
          discounted: {
            count: deduplicated.discounted.length,
            products: deduplicated.discounted,
          },
        },
        summary: {
          totalProducts: products.length,
          allocatedProducts:
            deduplicated.platinum.length +
            deduplicated.gold.length +
            deduplicated.silver.length +
            deduplicated.discounted.length,
<<<<<<< HEAD
          unallocatedProducts:
            products.length -
            (deduplicated.platinum.length +
              deduplicated.gold.length +
              deduplicated.silver.length +
              deduplicated.discounted.length),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Product allocation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
=======
          unallocatedProducts: products.length - (
            deduplicated.platinum.length +
            deduplicated.gold.length +
            deduplicated.silver.length +
            deduplicated.discounted.length
          ),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product allocation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
>>>>>>> 2f2bb25 (Done)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to allocate products",
        message: errorMessage,
      },
<<<<<<< HEAD
      { status: 500 },
=======
      { status: 500 }
>>>>>>> 2f2bb25 (Done)
    );
  }
}

/**
 * GET /api/products/allocate
 * Returns allocation statistics
 */
export async function GET() {
  return NextResponse.json(
    {
      message: "Product allocation endpoint",
      methods: {
        POST: "Send products array to allocate them to sections",
      },
      example: {
        request: {
          products: [{ _id: "123", name: "Product", rating: 4.5, orders: 50 }],
          showNew: true,
          rotationIndex: 0,
        },
      },
    },
<<<<<<< HEAD
    { status: 200 },
=======
    { status: 200 }
>>>>>>> 2f2bb25 (Done)
  );
}
