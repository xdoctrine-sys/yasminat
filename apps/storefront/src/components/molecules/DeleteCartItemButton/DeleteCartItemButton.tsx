"use client"

import { Button } from "@/components/atoms"
import {YasIcon} from "@/components/yasminat/Icon"
import {useYasminat} from "@/components/yasminat/Provider"
import { useCartContext } from "@/components/providers"
import { toast } from "@/lib/helpers/toast"

export const DeleteCartItemButton = ({
  id,
  disabled,
}: {
  id: string
  disabled?: boolean
}) => {
  const {tr}=useYasminat();
  const { removeCartItem, isRemovingItem } = useCartContext()

  const handleDelete = async (id: string) => {
    try {
      await removeCartItem(id)
    } catch (error) {
      console.error("Error deleting cart item:", error)
      toast.error({
        title: "Failed to remove item from cart",
      })
    }
  }

  const isBtnDisabled = isRemovingItem || disabled || !id

  return (
    <Button
      variant="text"
      className="remove-button"
      onClick={() => handleDelete(id)}
      loading={isRemovingItem}
      disabled={isBtnDisabled}
      aria-label={tr('حذف المنتج من السلة','Remove item from cart')}
    >
      <YasIcon name="trash"/>
    </Button>
  )
}
