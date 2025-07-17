import Alert from "react-bootstrap/Alert"
import Badge from "react-bootstrap/Badge"
import Button from "react-bootstrap/Button"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import Card from "react-bootstrap/Card"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Spinner from "react-bootstrap/Spinner"

interface TemplateListProps {
  templates: Template[]
  loading: boolean
  error: string | null
  onCreate: () => void
  onEdit: (template: Template) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

export const TemplateList = ({
  templates,
  loading,
  error,
  onCreate,
  onEdit,
  onDelete,
  onSetDefault,
}: TemplateListProps) => {
  if (loading) {
    return <Spinner animation="border" />
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  if (templates.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Card.Text>No templates yet.</Card.Text>
          <Button variant="primary" type="button" onClick={onCreate}>
            Create template
          </Button>
        </Card.Body>
      </Card>
    )
  }

  // デフォルトテンプレートを最初に置き、それ以降は更新日時の降順でソート
  const sortedTemplates = templates.toSorted((a, b) => {
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return b.updatedAt - a.updatedAt
  })

  return (
    <>
      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" type="button" onClick={onCreate}>
          Create template
        </Button>
      </div>
      <Row xs={1} md={2} className="g-4">
        {sortedTemplates.map((template) => (
          <Col key={template.id}>
            <Card>
              <Card.Body>
                <Card.Title>
                  {template.name}
                  {template.isDefault && <Badge bg="primary">Default</Badge>}
                </Card.Title>
                <Card.Text>
                  <code>{template.content}</code>
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <ButtonGroup size="sm">
                    {!template.isDefault && (
                      <Button
                        variant="primary"
                        type="button"
                        onClick={() => onSetDefault(template.id)}
                      >
                        <i className="bi bi-star-fill"></i>
                      </Button>
                    )}
                    <Button
                      variant="success"
                      type="button"
                      onClick={() => onEdit(template)}
                    >
                      <i className="bi bi-pen-fill"></i>
                    </Button>
                    <Button
                      variant="danger"
                      type="button"
                      onClick={() => onDelete(template.id)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </Button>
                  </ButtonGroup>
                  <small className="text-body-secondary">
                    <time dateTime={new Date(template.updatedAt).toISOString()}>
                      {new Date(template.updatedAt).toLocaleString()}
                    </time>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
