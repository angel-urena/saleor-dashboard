import {
  Button,
  Card,
  IconButton,
  TableCell,
  TableRow
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import CardTitle from "@saleor/components/CardTitle";
import Checkbox from "@saleor/components/Checkbox";
import ResponsiveTable from "@saleor/components/ResponsiveTable";
import Skeleton from "@saleor/components/Skeleton";
import {
  SortableTableBody,
  SortableTableRow
} from "@saleor/components/SortableTable";
import TableHead from "@saleor/components/TableHead";
import { makeStyles } from "@saleor/macaw-ui";
import { maybe, renderCollection, stopPropagation } from "@saleor/misc";
import { ListActions, ReorderAction } from "@saleor/types";
import { ProductAttributeType } from "@saleor/types/globalTypes";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
  ProductTypeDetails_productType_productAttributes,
  ProductTypeDetails_productType_variantAttributes
} from "../../types/ProductTypeDetails";

const useStyles = makeStyles(
  {
    colAction: {
      "&:last-child": {
        paddingRight: 0
      },
      width: 80
    },
    colGrab: {
      width: 60
    },
    colName: {},
    colSlug: {
      width: 300
    },
    colVariant: {
      width: 150
    },
    link: {
      cursor: "pointer"
    },
    textLeft: {
      textAlign: "left"
    }
  },
  { name: "ProductTypeAttributes" }
);

interface ProductTypeVariantAttributesProps extends ListActions {
  attributes:
    | ProductTypeDetails_productType_productAttributes[]
    | ProductTypeDetails_productType_variantAttributes[];
  disabled: boolean;
  type: string;
  testId?: string;
  onAttributeAssign: (type: ProductAttributeType) => void;
  onAttributeClick: (id: string) => void;
  onAttributeReorder: ReorderAction;
  onAttributeUnassign: (id: string) => void;
  // onAttributeVariantSelection?: (isActive: boolean) => void;
}

function handleContainerAssign(
  variantID: string,
  isSelected: boolean,
  selectedAttributes: string[],
  setSelectedAttributes: (data: string[]) => void
) {
  if (isSelected) {
    setSelectedAttributes(
      selectedAttributes.filter(
        selectedContainer => selectedContainer !== variantID
      )
    );
  } else {
    setSelectedAttributes([...selectedAttributes, variantID]);
  }
}

const numberOfColumns = 5;

const ProductTypeVariantAttributes: React.FC<ProductTypeVariantAttributesProps> = props => {
  const {
    attributes,
    disabled,
    isChecked,
    selected,
    toggle,
    toggleAll,
    toolbar,
    type,
    testId,
    onAttributeAssign,
    onAttributeClick,
    onAttributeReorder,
    onAttributeUnassign
  } = props;
  const classes = useStyles(props);

  const intl = useIntl();

  const [selectedAttributes, setSelectedAttributes] = React.useState<string[]>(
    []
  );

  return (
    <Card
      data-test={
        type === ProductAttributeType.PRODUCT
          ? "product-attributes"
          : "variant-attributes"
      }
    >
      <CardTitle
        title={
          type === ProductAttributeType.PRODUCT
            ? intl.formatMessage({
                defaultMessage: "Product Attributes",
                description: "section header"
              })
            : intl.formatMessage({
                defaultMessage: "Variant Attributes",
                description: "section header"
              })
        }
        toolbar={
          <Button
            data-test-id={testId}
            color="primary"
            variant="text"
            onClick={() => onAttributeAssign(ProductAttributeType[type])}
          >
            <FormattedMessage
              defaultMessage="Assign attribute"
              description="button"
            />
          </Button>
        }
      />
      <ResponsiveTable>
        <colgroup>
          <col className={classes.colGrab} />
          <col />
          <col className={classes.colName} />
          <col className={classes.colSlug} />
          <col className={classes.colVariant} />
          <col className={classes.colAction} />
        </colgroup>
        {attributes?.length > 0 && (
          <TableHead
            colSpan={numberOfColumns}
            disabled={disabled}
            dragRows
            selected={selected}
            items={attributes}
            toggleAll={toggleAll}
            toolbar={toolbar}
          >
            <TableCell className={classes.colName}>
              <FormattedMessage defaultMessage="Attribute name" />
            </TableCell>
            <TableCell className={classes.colName}>
              <FormattedMessage
                defaultMessage="Slug"
                description="attribute internal name"
              />
            </TableCell>
            <TableCell className={classes.colName}>
              <FormattedMessage
                defaultMessage="Variant Selection"
                description="attribute checkbox"
              />
            </TableCell>
            <TableCell />
          </TableHead>
        )}
        <SortableTableBody onSortEnd={onAttributeReorder}>
          {renderCollection(
            attributes,
            (attribute, attributeIndex) => {
              const isVariantSelected = attribute
                ? isChecked(attribute.id)
                : false;

              const isSelected = !!selectedAttributes.find(
                selectedAttribute => selectedAttribute === attribute.id
              );

              return (
                <SortableTableRow
                  selected={isVariantSelected}
                  className={!!attribute ? classes.link : undefined}
                  hover={!!attribute}
                  onClick={
                    !!attribute
                      ? () => onAttributeClick(attribute.id)
                      : undefined
                  }
                  key={maybe(() => attribute.id)}
                  index={attributeIndex || 0}
                  data-test="id"
                  data-test-id={maybe(() => attribute.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isVariantSelected}
                      disabled={disabled}
                      disableClickPropagation
                      onChange={() => toggle(attribute.id)}
                    />
                  </TableCell>
                  <TableCell className={classes.colName} data-test="name">
                    {maybe(() => attribute.name) ? (
                      attribute.name
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell className={classes.colSlug} data-test="slug">
                    {maybe(() => attribute.slug) ? (
                      attribute.slug
                    ) : (
                      <Skeleton />
                    )}
                  </TableCell>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={disabled}
                      disableClickPropagation
                      onChange={() =>
                        handleContainerAssign(
                          attribute.id,
                          isSelected,
                          selectedAttributes,
                          setSelectedAttributes
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className={classes.colAction}>
                    <IconButton
                      onClick={stopPropagation(() =>
                        onAttributeUnassign(attribute.id)
                      )}
                    >
                      <DeleteIcon color="primary" />
                    </IconButton>
                  </TableCell>
                </SortableTableRow>
              );
            },
            () => (
              <TableRow>
                <TableCell colSpan={numberOfColumns}>
                  <FormattedMessage defaultMessage="No attributes found" />
                </TableCell>
              </TableRow>
            )
          )}
        </SortableTableBody>
      </ResponsiveTable>
    </Card>
  );
};
ProductTypeVariantAttributes.displayName = "ProductTypeVariantAttributes";
export default ProductTypeVariantAttributes;