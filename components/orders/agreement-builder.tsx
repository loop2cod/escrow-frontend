"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SignaturePad } from "./signature-pad";
import {
  Plus,
  X,
  Eye,
  Type,
  AlignLeft,
  Calendar,
  Hash,
  CheckSquare,
  User,
  MapPin,
  Phone,
  Mail,
  Link as LinkIcon,
  PenTool,
  MoveUp,
  MoveDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "checkbox"
  | "fullname"
  | "email"
  | "phone"
  | "address"
  | "link"
  | "signature";

export interface AgreementField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  description?: string;
}

interface AgreementBuilderProps {
  fields: AgreementField[];
  onChange: (fields: AgreementField[]) => void;
}

interface FieldTypeOption {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
  category: "basic" | "contact" | "signature";
}

const fieldTypes: FieldTypeOption[] = [
  // Basic Fields
  { type: "text", label: "Short Text", icon: <Type className="size-4" />, category: "basic" },
  { type: "textarea", label: "Long Text", icon: <AlignLeft className="size-4" />, category: "basic" },
  { type: "number", label: "Number", icon: <Hash className="size-4" />, category: "basic" },
  { type: "date", label: "Date", icon: <Calendar className="size-4" />, category: "basic" },
  { type: "checkbox", label: "Checkbox", icon: <CheckSquare className="size-4" />, category: "basic" },

  // Contact Info
  { type: "fullname", label: "Full Name", icon: <User className="size-4" />, category: "contact" },
  { type: "email", label: "Email", icon: <Mail className="size-4" />, category: "contact" },
  { type: "phone", label: "Phone", icon: <Phone className="size-4" />, category: "contact" },
  { type: "address", label: "Address", icon: <MapPin className="size-4" />, category: "contact" },
  { type: "link", label: "Link/URL", icon: <LinkIcon className="size-4" />, category: "contact" },

  // Signature
  { type: "signature", label: "Signature", icon: <PenTool className="size-4" />, category: "signature" },
];

export function AgreementBuilder({ fields, onChange }: AgreementBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const addField = (type: FieldType) => {
    const fieldType = fieldTypes.find(f => f.type === type);
    const newField: AgreementField = {
      id: `field-${Date.now()}`,
      type,
      label: fieldType?.label || "",
      placeholder: "",
      required: false,
      description: "",
    };
    onChange([...fields, newField]);
    setExpandedFields(new Set([...expandedFields, newField.id]));
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    const newExpanded = new Set(expandedFields);
    newExpanded.delete(id);
    setExpandedFields(newExpanded);
  };

  const updateField = (id: string, updates: Partial<AgreementField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < fields.length) {
      [newFields[index], newFields[targetIndex]] = [
        newFields[targetIndex],
        newFields[index],
      ];
      onChange(newFields);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFields(newExpanded);
  };

  const renderPreviewField = (field: AgreementField) => {
    const commonProps = {
      placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
      disabled: true,
    };

    switch (field.type) {
      case "textarea":
        return <Textarea {...commonProps} rows={4} className="resize-none" />;

      case "checkbox":
        return (
          <div className="flex items-start gap-3 p-4 border rounded-md bg-muted/30">
            <input type="checkbox" disabled className="size-4 mt-0.5" />
            <span className="text-sm">{field.placeholder || field.label}</span>
          </div>
        );

      case "fullname":
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input {...commonProps} placeholder="First name" />
            <Input {...commonProps} placeholder="Last name" />
          </div>
        );

      case "address":
        return (
          <div className="space-y-3">
            <Input {...commonProps} placeholder="Street address" />
            <Input {...commonProps} placeholder="Apartment, suite, etc. (optional)" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input {...commonProps} placeholder="City" />
              <Input {...commonProps} placeholder="State" />
              <Input {...commonProps} placeholder="ZIP code" />
            </div>
          </div>
        );

      case "phone":
        return <Input {...commonProps} type="tel" placeholder="+1 (555) 000-0000" />;

      case "email":
        return <Input {...commonProps} type="email" placeholder="example@email.com" />;

      case "link":
        return <Input {...commonProps} type="url" placeholder="https://example.com" />;

      case "signature":
        return <SignaturePad onSave={() => {}} disabled />;

      case "date":
        return <Input {...commonProps} type="date" />;

      case "number":
        return <Input {...commonProps} type="number" />;

      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Form Preview</h3>
            <p className="text-xs text-muted-foreground">
              How users will see your agreement
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(false)}
            type="button"
          >
            <X className="mr-2 size-3" />
            Close Preview
          </Button>
        </div>

        <div className="space-y-6 p-6 border rounded-lg bg-muted/20">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              {renderPreviewField(field)}
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No fields added. Close preview to add fields.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Agreement Form Builder</h3>
          <p className="text-xs text-muted-foreground">
            Add and customize fields for your agreement
          </p>
        </div>
        {fields.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(true)}
            type="button"
          >
            <Eye className="mr-2 size-3" />
            Preview
          </Button>
        )}
      </div>

      {/* Field List */}
      <div className="space-y-2">
        {fields.map((field, index) => {
          const fieldTypeInfo = fieldTypes.find(ft => ft.type === field.type);
          const isExpanded = expandedFields.has(field.id);

          return (
            <div
              key={field.id}
              className="border rounded-lg bg-card overflow-hidden"
            >
              {/* Field Header - Always Visible */}
              <button
                onClick={() => toggleExpanded(field.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                type="button"
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} field: ${field.label || 'Untitled'}`}
              >
                <div className="p-1.5 rounded bg-primary/10 text-primary shrink-0">
                  {fieldTypeInfo?.icon || <Type className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {field.label || "Untitled Field"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fieldTypeInfo?.label}
                    {field.required && " • Required"}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, "up");
                    }}
                    disabled={index === 0}
                    type="button"
                    aria-label="Move field up"
                  >
                    <MoveUp className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveField(index, "down");
                    }}
                    disabled={index === fields.length - 1}
                    type="button"
                    aria-label="Move field down"
                  >
                    <MoveDown className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeField(field.id);
                    }}
                    type="button"
                    aria-label="Delete field"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </button>

              {/* Field Editor - Expandable */}
              {isExpanded && (
                <div className="p-4 pt-0 space-y-3 border-t bg-muted/20">
                  <div className="space-y-1.5">
                    <Label htmlFor={`label-${field.id}`} className="text-xs">
                      Field Label
                    </Label>
                    <Input
                      id={`label-${field.id}`}
                      placeholder="Enter field label"
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.id, { label: e.target.value })
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`description-${field.id}`} className="text-xs">
                      Description (optional)
                    </Label>
                    <Input
                      id={`description-${field.id}`}
                      placeholder="Help text for this field"
                      value={field.description}
                      onChange={(e) =>
                        updateField(field.id, { description: e.target.value })
                      }
                      className="text-sm"
                    />
                  </div>

                  {field.type !== "signature" && (
                    <div className="space-y-1.5">
                      <Label htmlFor={`placeholder-${field.id}`} className="text-xs">
                        Placeholder
                      </Label>
                      <Input
                        id={`placeholder-${field.id}`}
                        placeholder="Placeholder text"
                        value={field.placeholder}
                        onChange={(e) =>
                          updateField(field.id, { placeholder: e.target.value })
                        }
                        className="text-sm"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id={`required-${field.id}`}
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(field.id, { required: e.target.checked })
                      }
                      className="size-4 rounded"
                    />
                    <Label
                      htmlFor={`required-${field.id}`}
                      className="text-xs font-normal cursor-pointer"
                    >
                      Required field
                    </Label>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/10">
            <p className="text-sm text-muted-foreground">
              No fields yet. Add your first field below.
            </p>
          </div>
        )}
      </div>

      {/* Add Field Buttons - Simplified Grid */}
      <div className="space-y-3 pt-2">
        <Label className="text-xs font-semibold text-muted-foreground">
          ADD FIELD
        </Label>

        {/* Basic Fields */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Basic</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {fieldTypes.filter(ft => ft.category === "basic").map((fieldType) => (
              <Button
                key={fieldType.type}
                variant="outline"
                size="sm"
                onClick={() => addField(fieldType.type)}
                type="button"
                className="justify-start gap-2"
              >
                <span className="text-primary">{fieldType.icon}</span>
                <span className="text-xs">{fieldType.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Contact Info</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {fieldTypes.filter(ft => ft.category === "contact").map((fieldType) => (
              <Button
                key={fieldType.type}
                variant="outline"
                size="sm"
                onClick={() => addField(fieldType.type)}
                type="button"
                className="justify-start gap-2"
              >
                <span className="text-primary">{fieldType.icon}</span>
                <span className="text-xs">{fieldType.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Signature</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {fieldTypes.filter(ft => ft.category === "signature").map((fieldType) => (
              <Button
                key={fieldType.type}
                variant="outline"
                size="sm"
                onClick={() => addField(fieldType.type)}
                type="button"
                className="justify-start gap-2"
              >
                <span className="text-primary">{fieldType.icon}</span>
                <span className="text-xs">{fieldType.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
