import { spawn } from 'node:child_process';

const IROH_BIN = process.env.IROH_BIN || 'iroh';

export function irohAdd(filePath: string): Promise<{ cid: string }> {
  return new Promise((resolve, reject) => {
    // iroh v0.28.0 uses: iroh blobs add <file>
    // Assumes iroh node is already running (started by docker-entrypoint.sh)
    const p = spawn(IROH_BIN, ['blobs', 'add', filePath]);
    let out = ''; let err = '';
    p.stdout.on('data', d => out += d.toString());
    p.stderr.on('data', d => err += d.toString());
    p.on('close', (code) => {
      if (code !== 0) return reject(new Error(err || `iroh add exit ${code}`));

      // Parse output to extract blob hash
      // Output format: "Blob: <hash>"
      // Example: "Blob: ry6q4a5suvtjtnxuaaaln46erw7hvdjuppqv6v4zhthgvidvvciq"
      const blobMatch = out.match(/Blob:\s+([a-z0-9]+)/i);
      if (blobMatch) {
        resolve({ cid: blobMatch[1] });
        return;
      }

      // Fallback: try to find hash on the first line (format: "- path: size hash")
      const lineMatch = out.match(/:\s+\d+\s+[BKM]+\s+([a-z0-9]{52,})/i);
      if (lineMatch) {
        resolve({ cid: lineMatch[1] });
        return;
      }

      return reject(new Error('No blob hash found in iroh output: ' + out));
    });
  });
}

export function irohGetStream(cid: string) {
  // iroh v0.28.0 uses: iroh blobs export <hash> STDOUT
  // Assumes iroh node is already running
  return spawn(IROH_BIN, ['blobs', 'export', cid, 'STDOUT']);
}

export function irohDelete(cid: string): Promise<void> {
  return new Promise((resolve) => {
    // Since iroh v0.28.0 doesn't support blob deletion via CLI,
    // we'll manually remove the blob file from storage
    const irohDataDir = process.env.IROH_REPO || '/root/.local/share/iroh';
    const blobPath = `${irohDataDir}/blobs`;

    // Try to find and delete the blob file
    const findAndDelete = spawn('sh', ['-c', `find ${blobPath} -type f -name "*${cid}*" -delete 2>/dev/null || true`]);

    findAndDelete.on('close', () => {
      console.log(`[iroh delete] Attempted to delete blob files for ${cid} from ${blobPath}`);
      resolve();
    });

    findAndDelete.on('error', () => {
      console.warn(`[iroh delete] Could not delete blob ${cid}, will be cleaned up later`);
      resolve();
    });
  });
}

