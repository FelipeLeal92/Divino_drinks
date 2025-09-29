#!/usr/bin/env node

/**
 * Script para fazer backup do banco de dados e uploads
 * Uso: npm run backup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backupDir = path.join(__dirname, '..', 'backups');
const dbPath = path.join(__dirname, '..', 'data.sqlite');
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Criar diretório de backup se não existir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupName = `backup-${timestamp}`;
const backupPath = path.join(backupDir, backupName);

console.log(`Criando backup: ${backupName}`);

try {
  // Criar diretório do backup
  fs.mkdirSync(backupPath, { recursive: true });

  // Backup do banco de dados
  if (fs.existsSync(dbPath)) {
    const dbBackupPath = path.join(backupPath, 'data.sqlite');
    fs.copyFileSync(dbPath, dbBackupPath);
    console.log('✓ Banco de dados copiado');
  } else {
    console.log('⚠ Banco de dados não encontrado');
  }

  // Backup dos uploads
  if (fs.existsSync(uploadsDir)) {
    const uploadsBackupPath = path.join(backupPath, 'uploads');
    
    // Usar cp -r para copiar recursivamente
    try {
      execSync(`cp -r "${uploadsDir}" "${uploadsBackupPath}"`);
      console.log('✓ Uploads copiados');
    } catch (err) {
      console.error('Erro ao copiar uploads:', err.message);
    }
  } else {
    console.log('⚠ Diretório de uploads não encontrado');
  }

  // Criar arquivo de informações do backup
  const backupInfo = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    files: fs.readdirSync(backupPath),
    size: getDirectorySize(backupPath)
  };

  fs.writeFileSync(
    path.join(backupPath, 'backup-info.json'),
    JSON.stringify(backupInfo, null, 2)
  );

  console.log('✅ Backup criado com sucesso!');
  console.log(`Localização: ${backupPath}`);
  console.log(`Tamanho: ${formatBytes(backupInfo.size)}`);

  // Limpar backups antigos (manter apenas os 10 mais recentes)
  cleanOldBackups();

} catch (error) {
  console.error('❌ Erro ao criar backup:', error.message);
  process.exit(1);
}

function getDirectorySize(dirPath) {
  let size = 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    
    if (stats.isFile()) {
      size += stats.size;
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => {
        calculateSize(path.join(itemPath, file));
      });
    }
  }
  
  calculateSize(dirPath);
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cleanOldBackups() {
  try {
    const backups = fs.readdirSync(backupDir)
      .filter(name => name.startsWith('backup-'))
      .map(name => ({
        name,
        path: path.join(backupDir, name),
        time: fs.statSync(path.join(backupDir, name)).mtime
      }))
      .sort((a, b) => b.time - a.time);

    if (backups.length > 10) {
      const toDelete = backups.slice(10);
      
      toDelete.forEach(backup => {
        try {
          execSync(`rm -rf "${backup.path}"`);
          console.log(`🗑 Backup antigo removido: ${backup.name}`);
        } catch (err) {
          console.error(`Erro ao remover backup ${backup.name}:`, err.message);
        }
      });
    }
  } catch (err) {
    console.error('Erro ao limpar backups antigos:', err.message);
  }
}
