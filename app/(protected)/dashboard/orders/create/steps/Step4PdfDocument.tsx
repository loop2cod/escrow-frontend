import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import Html from 'react-pdf-html';

// Register a standard font (optional, using Helvetica by default is fine for now, or Times)
// Times New Roman is standard for contracts.
// Note: @react-pdf/renderer supports basic fonts out of the box.

const styles = StyleSheet.create({
    page: {
        padding: 30, // Optimized padding for greater space utilization
        fontFamily: 'Times-Roman',
        fontSize: 11, // Standard readable size
        lineHeight: 1.4,
        backgroundColor: '#ffffff',
        textAlign: 'justify' // Utilize full width
    },
    header: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        textAlign: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    subtext: {
        fontSize: 9,
        color: '#6b7280',
    },
    section: {
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 11,
    },
    value: {
        fontSize: 11,
    },
    footer: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '45%',
    },
    signatureLine: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#000000',
        width: '100%',
    },
    signatureLabel: {
        fontWeight: 'bold',
        fontSize: 11,
        marginBottom: 4,
    },
    dateLine: {
        marginTop: 4,
        fontSize: 11,
    }
});

interface ContractPdfProps {
    title: string;
    description: string;
    terms: string;
    contractId?: string; // Optional
    date: string;
}

export const ContractPdfDocument = ({ title, description, terms, contractId, date }: ContractPdfProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* HTML Terms Content */}
            <View style={{ marginBottom: 20 }}>
                <Html stylesheet={{
                    // Text blocks
                    p: { marginBottom: 6, fontSize: 11, lineHeight: 1.4, textAlign: 'justify' },
                    h1: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 4, textTransform: 'uppercase' },
                    h2: { fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginTop: 4 },
                    h3: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, marginTop: 4 },
                    h4: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, marginTop: 4 },

                    // Formatting
                    strong: { fontWeight: 'bold' },
                    b: { fontWeight: 'bold' },
                    em: { fontStyle: 'italic' },
                    i: { fontStyle: 'italic' },
                    u: { textDecoration: 'underline' },
                    s: { textDecoration: 'line-through' },
                    strike: { textDecoration: 'line-through' },
                    del: { textDecoration: 'line-through' },
                    a: { color: '#2563eb', textDecoration: 'underline' },

                    // Lists
                    ul: { marginBottom: 6, marginLeft: 15 },
                    ol: { marginBottom: 6, marginLeft: 15 },
                    li: { marginBottom: 2, fontSize: 11, textAlign: 'justify' },

                    // Quotes & Others
                    blockquote: {
                        marginLeft: 10,
                        borderLeftWidth: 2,
                        borderLeftColor: '#cbd5e1',
                        paddingLeft: 10,
                        color: '#4b5563',
                        fontStyle: 'italic',
                        marginBottom: 6
                    },
                    // Code blocks
                    code: { fontFamily: 'Courier', backgroundColor: '#f3f4f6', padding: 2 },
                    pre: { fontFamily: 'Courier', backgroundColor: '#f3f4f6', padding: 5, marginBottom: 6 },

                    // Quill Alignment Classes
                    '.ql-align-center': { textAlign: 'center' },
                    '.ql-align-right': { textAlign: 'right' },
                    '.ql-align-justify': { textAlign: 'justify' }
                }}>
                    {terms}
                </Html>
            </View>
        </Page>
    </Document>
);
