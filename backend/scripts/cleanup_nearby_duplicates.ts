import { prisma } from '../src/config/db';

async function main() {
  const places = await prisma.nearbyPlace.findMany();
  let updatedCount = 0;

  for (const p of places) {
    let newDist = p.distance;
    let newTime = p.travelTime;
    let changed = false;

    // 1. Remove duplicate 'drive drive'
    if (newDist && /\b(drive)(\s+\1)+\b/i.test(newDist)) {
      newDist = newDist.replace(/\b(drive)(\s+\1)+\b/gi, 'drive');
      changed = true;
    }

    // 2. If travelTime is redundant with distance, clear travelTime
    if (newDist && newTime) {
      const dNorm = newDist.toLowerCase().replace(/\s+/g, ' ').trim();
      const tNorm = newTime.toLowerCase().replace(/\s+/g, ' ').trim();
      if (dNorm === tNorm || dNorm.includes(tNorm) || tNorm.includes(dNorm)) {
        newTime = null;
        changed = true;
      }
    }

    if (changed) {
      console.log(`Updating [${p.name}]: "${p.distance}" / "${p.travelTime}" -> "${newDist}" / "${newTime}"`);
      await prisma.nearbyPlace.update({
        where: { id: p.id },
        data: {
          distance: newDist,
          travelTime: newTime,
        },
      });
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully cleaned up ${updatedCount} nearby place records.`);
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
