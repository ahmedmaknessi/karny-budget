import { db } from '@/lib/db/client';
import { categories } from '@/drizzle/schema';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { eq } from 'drizzle-orm';

export async function seedCategories(): Promise<void> {
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.insert(categories).values({
        id:     cat.id,
        name:   cat.name,
        icon:   cat.icon,
        color:  cat.color,
        type:   cat.type,
        userId: null,
      });
    }
  } else {
    for (const cat of DEFAULT_CATEGORIES) {
      await db.update(categories)
        .set({
          name:  cat.name,
          icon:  cat.icon,
          color: cat.color,
        })
        .where(eq(categories.id, cat.id));
    }
  }
}
