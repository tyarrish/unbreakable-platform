'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Quote,
  Undo,
  Redo,
  Link as LinkIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...', className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    immediatelyRender: false, // Fix SSR hydration mismatch
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn('border border-rogue-sage/20 rounded-lg bg-white', className)}>
      {/* Toolbar */}
      <div className="border-b border-rogue-sage/20 p-2 flex flex-wrap gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold size={18} />}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic size={18} />}
          label="Italic"
        />
        <div className="w-px h-6 bg-rogue-sage/20 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 size={18} />}
          label="Heading"
        />
        <div className="w-px h-6 bg-rogue-sage/20 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List size={18} />}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered size={18} />}
          label="Numbered List"
        />
        <div className="w-px h-6 bg-rogue-sage/20 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<Quote size={18} />}
          label="Quote"
        />
        <div className="w-px h-6 bg-rogue-sage/20 mx-1" />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          isActive={editor.isActive('link')}
          icon={<LinkIcon size={18} />}
          label="Link"
        />
        <div className="flex-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo size={18} />}
          label="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo size={18} />}
          label="Redo"
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="prose-rogue" />
    </div>
  )
}

function ToolbarButton({ 
  onClick, 
  isActive, 
  disabled, 
  icon, 
  label 
}: { 
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-2 rounded hover:bg-rogue-sage/10 transition-colors',
        isActive && 'bg-rogue-sage/20 text-rogue-forest',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
      title={label}
      type="button"
    >
      {icon}
    </button>
  )
}

