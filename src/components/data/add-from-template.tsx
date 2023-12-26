import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Revenue, RevenueListProps } from './transactions';
import Edit_Box from './edit-data';

type AddFromTemplateProps {
  revenueList: Revenue[];
  onEdit: (editedList: Revenue[]) => void;
  onDelete: (deletedId: number) => void;
  editRevenues: (editedList: Revenue[]) => void;
}



const AddFromTemplate: React.FC<AddFromTemplateProps> = ({ revenueList, onEdit, onDelete, editRevenues}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<Revenue | null>(null);
  const [selectedRevenues, setSelectedRevenues] = useState<Record<number, number>>({});
  const { colorMode } = useColorMode();

  // Create a copy of the revenueList to avoid modifying the original

  const handleEditClick = (rowData: Revenue) => {
    setSelectedRowData(rowData);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (rowData: Revenue) => {
    setSelectedRowData(rowData);
    setIsDeleteModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRowData(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRowData(null);
  };

  const handleDeleteConfirm = () => {
    if (selectedRowData) {
      onDelete(selectedRowData.payment_id);
      setIsDeleteModalOpen(false);
      setSelectedRowData(null);
    }
  };

  const handleEditConfirm = (editedData: Revenue) => {
    onEdit(editedData);
    setIsEditModalOpen(false);
    setSelectedRowData(null);
  };

  useEffect(() => {
    // Update selectedRowData based on the selected index
    if (Object.keys(selectedRevenues).length > 0) {
      const selectedIndex = parseInt(Object.keys(selectedRevenues)[0], 10);
      setSelectedRowData({ ...revenueList[selectedIndex], quantity: selectedRevenues[selectedIndex] });
    }
  }, [selectedRevenues, revenueList]);

  const handleToggleSelection = (index: number) => {
    setSelectedRevenues((prevSelected) => {
      const updatedSelected = { ...prevSelected };
      if (!updatedSelected[index]) {
        updatedSelected[index] = updatedSelected[index] !== undefined ? updatedSelected[index] : 0; // Set default value to 0
      }

      return updatedSelected;
    });
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    setSelectedRevenues((prevSelected) => ({
      ...prevSelected,
      [index]: newQuantity !== undefined ? newQuantity : 0, // Set default value to 0
    }));
  };

  const handleAddToNewList = () => {
    Object.entries(selectedRevenues).forEach(([index, qty]) => {
      const selectedIndex = parseInt(index, 10);
      const selectedRevenue = revenueList[selectedIndex];
      const newItem = { ...selectedRevenue, quantity: qty };
      setNewList((prevList) => [...prevList, newItem]);
    });

    // Reset selections after adding to the new list
    setSelectedRevenues({});
    setSelectedRowData(null);
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg">
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Available List
      </Text>
      <Stack spacing={4}>
        {revenueList.map((revenue, index) => (
          <Flex
            key={index}
            alignItems="center"
            justifyContent="space-between"
            p={2}
            bg={selectedRowData === revenue ? 'gray.600' : 'transparent'}
            _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.50' }}
          >
            <Box flex="1">
              {revenue.categories.map((category) => `${category.key}: ${category.value}, `)}
              Amount: {revenue.amount}, Date: {revenue.date.toLocaleDateString()}, Type: {revenue.type}
            </Box>
            <Flex alignItems="center">
              <Input
                type="number"
                min={0}
                value={selectedRevenues[index] || ''}
                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                w="50px"
                mr={2}
              />
              <IconButton
                icon={<FaEdit />}
                aria-label="Edit"
                onClick={() => handleEditClick(revenue)}
                variant="outline"
                colorScheme="teal"
                size="sm"
                mr={2}
              />
              <IconButton
                icon={<FaTrash />}
                aria-label="Delete"
                onClick={() => handleDeleteClick(revenue)}
                variant="outline"
                colorScheme="red"
                size="sm"
              />
            </Flex>
          </Flex>
        ))}
      </Stack>
      <Flex align="center" mt={4}>
        <Button onClick={handleAddToNewList} disabled={Object.values(selectedRevenues).every((qty) => qty <= 0)} size="md">
          Add to New List
        </Button>
      </Flex>
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRowData && (
              <Edit_Box
                transaction={selectedRowData}
                revenueList={revenueList} 
                onSave={handleEditConfirm}
                onClose={handleCloseEditModal}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.500">Delete Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              Are you sure you want to delete the following record?
            </Text>
            {selectedRowData && (
              <Box>
                <Text>
                  <strong>Transaction Type: </strong> {selectedRowData.type}
                </Text>
                <Text mt={2}>
                  <strong>Categories:</strong>
                </Text>
                <Box ml={4}>
                  {selectedRowData.categories.map((category, index) => (
                    <Box key={index} mt={1}>
                      <Text>
                        <strong>{category.key}</strong> {category.value}
                      </Text>
                    </Box>
                  ))}
                </Box>
                <br />
                <Text>
                  <strong>Amount:</strong> ${selectedRowData.amount}
                </Text>
                <Text>
                  <strong>Date:</strong> {selectedRowData.date?.toLocaleDateString()}
                </Text>
              </Box>
            )}
            <Button colorScheme="red" onClick={handleDeleteConfirm} mt={4}>
              Confirm Delete
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AddFromTemplate;
