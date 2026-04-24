"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface UOM {
  id: string;
  name: string;
  description?: string;
}

export interface TestCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MedicalTest {
  id: string;
  name: string;
  description?: string;
  iduom: string | null;
  idcategory: string | null;
  normalmin: number | null;
  normalmax: number | null;
  // Joined fields for display
  uom_name?: string;
  category_name?: string;
}

/**
 * Helper to check permissions
 */
async function checkPermission(requiredRoles: string[] = ["ADMINISTRATOR"]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const { rows } = await query<{ roleId: string }>(
    'SELECT "roleId" FROM public.usersroles WHERE "userId" = $1',
    [session.user.id]
  );
  const userRoles = rows.map((r) => r.roleId);

  const hasPermission = requiredRoles.some((r) => userRoles.includes(r));
  if (!hasPermission) throw new Error("Forbidden");

  return session.user;
}

/**
 * Initialize the relational tables if they don't exist
 */
async function initTables() {
  // 1. Units of Measure Table
  await query(`
    CREATE TABLE IF NOT EXISTS public.uom (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(15) UNIQUE NOT NULL,
        description TEXT
    )
  `);

  // 2. Medical Test Categories Table
  await query(`
    CREATE TABLE IF NOT EXISTS public.testcategories (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
    )
  `);

  // 3. Medical Tests Table
  await query(`
    CREATE TABLE IF NOT EXISTS public.medicaltests (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        iduom BIGINT REFERENCES public.uom(id),
        idcategory BIGINT REFERENCES public.testcategories(id),
        normalmin REAL,
        normalmax REAL
    )
  `);
}

export async function getUOMs(): Promise<UOM[]> {
  try {
    await checkPermission();
    await initTables();
    const { rows } = await query<UOM>("SELECT id, name, description FROM public.uom ORDER BY name ASC");
    return rows;
  } catch (error) {
    console.error("Error fetching UOMs:", error);
    return [];
  }
}

export async function getTestCategories(): Promise<TestCategory[]> {
  try {
    await checkPermission();
    await initTables();
    const { rows } = await query<TestCategory>("SELECT id, name, description FROM public.testcategories ORDER BY name ASC");
    return rows;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getMedicalTests(): Promise<MedicalTest[]> {
  try {
    await checkPermission();
    await initTables();
    const { rows } = await query<MedicalTest>(`
      SELECT 
        m.id, m.name, m.description, m.iduom, m.idcategory, m.normalmin, m.normalmax,
        u.name as uom_name,
        c.name as category_name
      FROM public.medicaltests m
      LEFT JOIN public.uom u ON m.iduom = u.id
      LEFT JOIN public.testcategories c ON m.idcategory = c.id
      ORDER BY m.name ASC
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching medical tests:", error);
    return [];
  }
}

export async function addMedicalTest(data: Omit<MedicalTest, "id">) {
  try {
    await checkPermission();
    await initTables();
    await query(
      "INSERT INTO public.medicaltests (name, description, iduom, idcategory, normalmin, normalmax) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        data.name, 
        data.description || null, 
        data.iduom || null, 
        data.idcategory || null, 
        data.normalmin, 
        data.normalmax
      ]
    );
    revalidatePath("/dashboard/admin/medicaltests");
  } catch (error) {
    console.error("Error adding medical test:", error);
    throw new Error("Failed to add medical test");
  }
}

export async function updateMedicalTest(data: MedicalTest) {
  try {
    await checkPermission();
    await query(
      "UPDATE public.medicaltests SET name = $1, description = $2, iduom = $3, idcategory = $4, normalmin = $5, normalmax = $6 WHERE id = $7",
      [
        data.name, 
        data.description || null, 
        data.iduom || null, 
        data.idcategory || null, 
        data.normalmin, 
        data.normalmax, 
        data.id
      ]
    );
    revalidatePath("/dashboard/admin/medicaltests");
  } catch (error) {
    console.error("Error updating medical test:", error);
    throw new Error("Failed to update medical test");
  }
}

export async function deleteMedicalTest(id: string) {
  try {
    await checkPermission();
    await query("DELETE FROM public.medicaltests WHERE id = $1", [id]);
    revalidatePath("/dashboard/admin/medicaltests");
  } catch (error) {
    console.error("Error deleting medical test:", error);
    throw new Error("Failed to delete medical test");
  }
}
