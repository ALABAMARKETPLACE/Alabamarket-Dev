import { Empty, Button, Badge, Avatar, Divider } from "antd";
import { DeleteOutlined, CheckCircleFilled, InboxOutlined } from "@ant-design/icons";
import "../../orders/Style.scss";

interface SubstituteItem {
  _id: number;
  name: string;
  image: string;
  price?: string;
  description?: string;
  [key: string]: unknown;
}

interface Props {
  select: SubstituteItem[];
  changeData: (newSelect: SubstituteItem[]) => void;
  handleSubmit: () => void;
  submitting?: boolean;
}

const SelectedProductsSubstitution = ({ select, changeData, handleSubmit, submitting }: Props) => {
  const removeItem = (id: number) => {
    changeData(select.filter((item) => item._id !== id));
  };

  return (
    <div className="sub-selected-panel">
      {/* Header */}
      <div className="sub-selected-header">
        <span className="sub-selected-title">
          <CheckCircleFilled style={{ color: "#22c55e", marginRight: 8 }} />
          Selected Replacements
        </span>
        {select.length > 0 && (
          <Badge
            count={select.length}
            style={{ backgroundColor: "#FF5F15" }}
          />
        )}
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* Product list */}
      <div className="sub-selected-list">
        {select.length === 0 ? (
          <div className="sub-selected-empty">
            <InboxOutlined style={{ fontSize: 36, color: "#d1d5db" }} />
            <p>No replacements added yet</p>
            <span>Browse products on the left and click <strong>Add</strong></span>
          </div>
        ) : (
          select.map((item) => (
            <div key={item._id} className="sub-selected-item">
              <Avatar
                src={item.image}
                size={48}
                shape="square"
                style={{ borderRadius: 8, flexShrink: 0, border: "1px solid #f0f0f0" }}
              />
              <div className="sub-selected-item-info">
                <div className="sub-selected-item-name">{item.name}</div>
                {item.price && (
                  <div className="sub-selected-item-price">{item.price}</div>
                )}
              </div>
              <button
                className="sub-selected-item-remove"
                onClick={() => removeItem(item._id)}
                title="Remove"
              >
                <DeleteOutlined />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Submit */}
      <div className="sub-selected-footer">
        <Button
          type="primary"
          size="large"
          block
          loading={submitting}
          disabled={select.length === 0}
          onClick={handleSubmit}
          style={{
            background: select.length > 0 ? "#FF5F15" : undefined,
            borderColor: select.length > 0 ? "#FF5F15" : undefined,
            borderRadius: 8,
            height: 48,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {submitting ? "Submitting…" : `Submit Substitution${select.length > 0 ? ` (${select.length})` : ""}`}
        </Button>
        {select.length === 0 && (
          <p className="sub-selected-hint">Add at least one replacement product to submit</p>
        )}
      </div>
    </div>
  );
};

export default SelectedProductsSubstitution;
