import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { MedicalTest } from "./actions";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    padding: 5,
  },
  col1: { width: '8%' },
  col2: { width: '25%' },
  col3: { width: '15%' },
  col4: { width: '12%' },
  col5: { width: '15%' },
  col6: { width: '25%' },
  cell: {
    padding: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  }
});

interface MedicalTestsPdfDocumentProps {
  tests: MedicalTest[];
}

const MedicalTestsPdfDocument: React.FC<MedicalTestsPdfDocumentProps> = ({ tests }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.title}>Medical Tests List</Text>
      
      <View style={styles.header}>
        <Text style={[styles.col1, styles.cell]}>#</Text>
        <Text style={[styles.col2, styles.cell]}>Test Name</Text>
        <Text style={[styles.col3, styles.cell]}>Category</Text>
        <Text style={[styles.col4, styles.cell]}>Unit</Text>
        <Text style={[styles.col5, styles.cell]}>Min - Max</Text>
        <Text style={[styles.col6, styles.cell]}>Description</Text>
      </View>

      {tests.map((test, index) => (
        <View key={test.id} style={styles.row}>
          <Text style={[styles.col1, styles.cell]}>{index + 1}</Text>
          <Text style={[styles.col2, styles.cell]}>{test.name}</Text>
          <Text style={[styles.col3, styles.cell]}>{test.category_name || "Uncategorized"}</Text>
          <Text style={[styles.col4, styles.cell]}>{test.uom_name || "-"}</Text>
          <Text style={[styles.col5, styles.cell]}>
            {test.normalmin !== null && test.normalmax !== null ? `${test.normalmin} - ${test.normalmax}` : (test.normalmin ?? test.normalmax ?? "-")}
          </Text>
          <Text style={[styles.col6, styles.cell]}>{test.description || ""}</Text>
        </View>
      ))}

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `Page ${pageNumber} of ${totalPages} - Generated on ${new Date().toLocaleString()}`
      )} fixed />
    </Page>
  </Document>
);

export default MedicalTestsPdfDocument;
