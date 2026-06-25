import { useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { importBackup } from '../../features/kanban/kanbanSlice'
import { buildBackupData, parseBackup } from '../../features/kanban/utils'
import { ConfirmDialog } from './ConfirmDialog'

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

export function BackupControls() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((state) => state.kanban.tasks)
  const archive = useAppSelector((state) => state.kanban.archive)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<ReturnType<
    typeof parseBackup
  > | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleExport() {
    const backup = buildBackupData(tasks, archive)
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const stamp = new Date().toISOString().slice(0, 10)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `glassflow-backup-${stamp}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const backup = parseBackup(parsed)
        if (!backup) {
          setImportError('Invalid backup file. Expected a GlassFlow JSON export.')
          return
        }
        setPendingImport(backup)
      } catch {
        setImportError('Could not read the file. Make sure it is valid JSON.')
      }
    }
    reader.readAsText(file)
  }

  function handleConfirmImport() {
    if (!pendingImport) return
    dispatch(importBackup(pendingImport))
    setPendingImport(null)
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleExport}
          aria-label="Export backup"
          title="Export JSON backup"
          className="icon-btn glass-subtle p-2 text-text-secondary hover:text-text-primary"
        >
          <DownloadIcon />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Import backup"
          title="Import JSON backup"
          className="icon-btn glass-subtle p-2 text-text-secondary hover:text-text-primary"
        >
          <UploadIcon />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {pendingImport && (
        <ConfirmDialog
          title="Import backup?"
          message={`This will replace your current board (${tasks.length} tasks) and archive (${archive.length} tasks) with the backup from ${new Date(pendingImport.exportedAt).toLocaleString()}.`}
          confirmLabel="Import"
          onConfirm={handleConfirmImport}
          onCancel={() => setPendingImport(null)}
        />
      )}

      {importError && (
        <ConfirmDialog
          title="Import failed"
          message={importError}
          confirmLabel="OK"
          onConfirm={() => setImportError(null)}
          onCancel={() => setImportError(null)}
        />
      )}
    </>
  )
}