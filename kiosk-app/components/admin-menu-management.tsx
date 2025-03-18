"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type MenuItem, type MenuCategory } from "@/lib/menu-data"
import { API_URL } from "@/lib/base"
import useAuth from "@/lib/useAuth"
import { useMenu } from "@/hooks/useMenu"

export function AdminMenuManagement() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isEditingItem, setIsEditingItem] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || "")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
  })
  const { isLogedIn, userType, token } = useAuth();
  const { menuItems } = useMenu();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }))
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      price: "",
      categoryId: selectedCategory,
    })
    setSelectedItem(null)
  }

  const handleAddItem = () => {
    setIsAddingItem(true)
    resetForm()
    setFormData((prev) => ({ ...prev, categoryId: selectedCategory }))
  }

  const handleEditItem = (item: MenuItem) => {
    setIsEditingItem(true)
    setSelectedItem(item)
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.categoryId,
    })
  }

  useEffect(() => {
    setCategories(menuItems)
    setSelectedCategory('starters');
  }, [menuItems])

  const handleDeleteItem = async (itemId: string, categoryId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {

      // call /menu/delete to delete an item
      try {
        const res = await fetch(API_URL + '/menu/delete.php', {
          method: "POST",
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: itemId, token })
        })
        const result = await res.json();
        if (res.ok) {
          const updatedCategories = categories.map((category) => {
            if (category.id === categoryId) {
              return {
                ...category,
                items: category.items.filter((item) => item.id !== itemId),
              }
            }
            return category
          })
          setCategories(updatedCategories)
        } else {
          alert(result.error);
        }
      } catch (error) {
        alert(`failed to ${isEditingItem ? 'edit' : 'add'} menu item, please try again`);
      }
    }
  }

  const handleSaveItem = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert("Please fill in all required fields")
      return
    }

    const newItem: MenuItem = {
      id: isEditingItem ? formData.id : `item-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      categoryId: formData.categoryId,
    }

    try {
      const endpoint = isEditingItem ? '/menu/edit.php' : '/menu/add.php';
      const res = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...newItem, token })
      })
      const result = await res.json();
      if (res.ok) {
        const menu_id = result.menu_id;
        // update categories
        const updatedCategories = categories.map((category) => {
          if (category.id === formData.categoryId) {
            if (isEditingItem) {
              return {
                ...category,
                items: category.items.map((item) => (item.id === newItem.id ? newItem : item)),
              }
            } else {
              return {
                ...category,
                items: [...category.items, { ...newItem, id: menu_id }],
              }
            }
          }
          return category
        })

        // set categories
        setCategories(updatedCategories);

        // reset to deaukt
        setIsAddingItem(false)
        setIsEditingItem(false)
        resetForm();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert(`failed to ${isEditingItem ? 'edit' : 'add'} menu item, please try again`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Menu Items</h3>
          <p className="text-sm text-gray-400">Manage your restaurant menu items</p>
        </div>
        <Button onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="category-filter">Filter by Category:</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-800/50 bg-gray-800">
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories
                .find((cat) => cat.id === selectedCategory)
                ?.items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-800/50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                    <TableCell>₹{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                          onClick={() => handleDeleteItem(item.id, item.categoryId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={isAddingItem || isEditingItem}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingItem(false)
            setIsEditingItem(false)
          }
        }}
      >
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>{isEditingItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditingItem ? "Make changes to the menu item here." : "Add a new item to your restaurant menu."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={handleSelectChange}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingItem(false)
                setIsEditingItem(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>{isEditingItem ? "Save Changes" : "Add Item"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

