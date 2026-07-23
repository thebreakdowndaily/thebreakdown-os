const fs = require('fs');
let c = fs.readFileSync('tests/dataset.test.ts', 'utf8');
c = c.replace(/MemoryDatasetService/g, 'MemoryDatasetRepository');
c = c.replace(/'\.\.\/services\/datasets\/service'/g, "'../services/repositories/memory/dataset'");
c = c.replace(/service\.get/g, 'await service.get');
c = c.replace(/service\.save/g, 'await service.save');
c = c.replace(/service\.delete/g, 'await service.delete');
fs.writeFileSync('tests/dataset.test.ts', c, 'utf8');
console.log('Successfully updated tests/dataset.test.ts');
