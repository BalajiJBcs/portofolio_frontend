import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { fetchBalanceSheet } from '../services/api';

type BalanceSheetRow = {
  Section: string;
  Title: string;
  CurrentYearValue: string;
  PreviousYearValue: string;
};

type BalanceSheetData = {
  Rows: BalanceSheetRow[];
  CurrentYear: string;
  PreviousYear: string;
};

const BalanceSheetTable: React.FC = () => {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseBalanceSheetData = (rawData: any): BalanceSheetData => {
    const parsedRows: BalanceSheetRow[] = [];
    const headerRow = rawData.Reports[0].Rows[0];
    const currentYear = headerRow?.Cells?.[1]?.Value || 'Current Year';
    const previousYear = headerRow?.Cells?.[2]?.Value || 'Previous Year';

    const parseSection = (section: any, sectionTitle: string) => {
      if (!section.Rows) return;

      section.Rows.forEach((row: any) => {
        if (row.RowType === 'Row' || row.RowType === 'SummaryRow') {
          parsedRows.push({
            Section: sectionTitle,
            Title: row.Cells?.[0]?.Value || 'N/A',
            CurrentYearValue: row.Cells?.[1]?.Value || 'N/A',
            PreviousYearValue: row.Cells?.[2]?.Value || 'N/A',
          });
        } else if (row.RowType === 'Section') {
          parseSection(row, row.Title || sectionTitle);
        }
      });
    };

    rawData.Reports[0].Rows.forEach((section: any) => {
      if (section.RowType === 'Section') {
        parseSection(section, section.Title || '');
      }
    });

    return { Rows: parsedRows, CurrentYear: currentYear, PreviousYear: previousYear };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawData = await fetchBalanceSheet();

        if (!rawData || !rawData.Reports || rawData.Reports.length === 0) {
          throw new Error('Invalid data structure.');
        }

        const parsedData = parseBalanceSheetData(rawData);
        setData(parsedData);
      } catch (err) {
        console.error('Error parsing data:', err);
        setError('Unable to fetch balance sheet data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  if (error)
    return (
      <Container>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Balance Sheet
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Section</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>{data?.CurrentYear}</TableCell>
            <TableCell>{data?.PreviousYear}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.Rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.Section}</TableCell>
              <TableCell>{row.Title}</TableCell>
              <TableCell>{row.CurrentYearValue}</TableCell>
              <TableCell>{row.PreviousYearValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default BalanceSheetTable;
