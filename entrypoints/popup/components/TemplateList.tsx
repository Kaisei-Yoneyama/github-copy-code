import { PencilIcon, StarIcon, TrashIcon } from "@primer/octicons-react"
import {
  ButtonGroup,
  Heading,
  IconButton,
  Label,
  Link,
  RelativeTime,
  Spinner,
  Stack,
  Tooltip,
  useConfirm,
} from "@primer/react"
import { Banner, Blankslate } from "@primer/react/experimental"
import styles from "./TemplateList.module.css"

interface TemplateListProps {
  templates: Template[]
  defaultTemplateId: string | null
  loading: boolean
  error: string | null
  onEdit: (template: Template) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export const TemplateList = ({
  templates,
  defaultTemplateId,
  loading,
  error,
  onEdit,
  onDelete,
  onSetDefault,
}: TemplateListProps) => {
  const confirm = useConfirm()

  if (loading) {
    return (
      <Stack align="center" justify="center" style={{ padding: "32px" }}>
        <Spinner size="medium" />
      </Stack>
    )
  }

  if (error) {
    return <Banner title="Error" variant="critical" description={error} />
  }

  if (templates.length === 0) {
    return (
      <Blankslate>
        <Blankslate.Heading>No templates yet</Blankslate.Heading>
        <Blankslate.Description>
          Create your first template to get started copying code with custom
          formatting.
        </Blankslate.Description>
      </Blankslate>
    )
  }

  // デフォルトテンプレートを最初に置き、それ以降は更新日時の降順でソート
  const sortedTemplates = templates.toSorted((a, b) => {
    if (a.id === defaultTemplateId) return -1
    if (b.id === defaultTemplateId) return 1
    return b.updatedAt - a.updatedAt
  })

  const handleDelete = async (template: Template) => {
    const confirmed = await confirm({
      title: "Delete template",
      content: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
      confirmButtonContent: "Delete",
      confirmButtonType: "danger",
    })
    if (confirmed) {
      onDelete(template.id)
    }
  }

  return (
    <>
      <div
        role="list"
        aria-label="Template list"
        className={styles.templateGrid}
      >
        {sortedTemplates.map((template) => (
          <article
            key={template.id}
            role="listitem"
            aria-label={`Template: ${template.name}`}
            className={styles.templateCard}
            data-default={template.id === defaultTemplateId}
          >
            <Stack
              direction="horizontal"
              align="center"
              justify="space-between"
              style={{ marginBottom: "12px" }}
            >
              <Heading as="h3" style={{ fontSize: "14px", margin: 0 }}>
                {template.name}
              </Heading>
              {template.id === defaultTemplateId && (
                <Label variant="accent" size="small">
                  Default
                </Label>
              )}
            </Stack>
            <pre className={styles.codeBlock}>
              <code
                style={{
                  fontSize: "12px",
                  fontFamily: "var(--fontStack-monospace)",
                  color: "var(--fgColor-default)",
                }}
              >
                {template.content}
              </code>
            </pre>
            <Stack
              direction="horizontal"
              align="center"
              justify="space-between"
            >
              {/* NOTE: <ButtonGroup /> の中で条件付きレンダーすると、左側のボタンが角丸にならない問題があるため、とりあえず別々の <ButtonGroup /> にして回避 */}
              {template.id === defaultTemplateId ? (
                <ButtonGroup>
                  <IconButton
                    size="small"
                    icon={PencilIcon}
                    aria-label="Edit template"
                    onClick={() => onEdit(template)}
                  />
                  <IconButton
                    size="small"
                    variant="danger"
                    icon={TrashIcon}
                    aria-label="Delete template"
                    onClick={() => handleDelete(template)}
                  />
                </ButtonGroup>
              ) : (
                <ButtonGroup>
                  <IconButton
                    size="small"
                    icon={StarIcon}
                    aria-label="Set as default template"
                    onClick={() => onSetDefault(template.id)}
                  />
                  <IconButton
                    size="small"
                    icon={PencilIcon}
                    aria-label="Edit template"
                    onClick={() => onEdit(template)}
                  />
                  <IconButton
                    size="small"
                    variant="danger"
                    icon={TrashIcon}
                    aria-label="Delete template"
                    onClick={() => handleDelete(template)}
                  />
                </ButtonGroup>
              )}
              <Tooltip
                text={new Date(template.updatedAt).toLocaleString()}
                direction="w"
              >
                <Link href="#" muted>
                  <RelativeTime date={new Date(template.updatedAt)} noTitle />
                </Link>
              </Tooltip>
            </Stack>
          </article>
        ))}
      </div>
    </>
  )
}
