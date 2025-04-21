import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  styled
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Virtuoso } from 'react-virtuoso';
import headerFieldsData from '../data/headerFields.json';
import headerTypesData from '../data/headerTypes.json';

interface FormField {
  id: number;
  level: number;
  tag: string;
  path: string;
  parentPath: string;
  xsdType: string | null;
  minOccurs: string;
  maxOccurs: string;
  isChoice: boolean;
  documentationName: string;
  documentationDefinition: string;
  subPaths: string[];
}

interface FieldType {
  name: string;
  documentationName: string;
  documentationDefinition: string;
  definitionType: string;
  restriction?: {
    base: string;
    facets: {
      pattern?: string;
      minInclusive?: string;
      totalDigits?: string;
      fractionDigits?: string;
      minLength?: string;
      maxLength?: string;
    } | null;
    enumerations: Array<{
      value: string;
      documentationName: string;
      documentationDefinition: string;
    }> | null;
  };
  list: null;
  union: null;
}

interface ApplicationHeaderProps {
  onSubmit: (data: Record<string, any>) => void;
}

// JSON verilerini doğru tipe dönüştür
const typedHeaderFields = headerFieldsData as unknown as FormField[];
const typedHeaderTypes = headerTypesData as unknown as FieldType[];

// Sola dayalı stil
const LeftAlignedBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%'
});

// Input container stil
const InputContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: '8px',
});

// Accordion için özel stil
const StyledAccordion = styled(Accordion)({
  width: '100%',
  marginBottom: '8px',
  '&:before': {
    display: 'none',
  },
});

// Input için özel stil
const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    fontSize: '1rem',
    minWidth: '300px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
  },
  width: '100%',
  maxWidth: '500px',
});

// Select için özel stil
const StyledFormControl = styled(FormControl)({
  '& .MuiInputBase-root': {
    fontSize: '1rem',
    minWidth: '300px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
  },
  '& .MuiMenuItem-root': {
    fontSize: '1rem',
  },
  '& .MuiSelect-select': {
    width: '100%',
  },
  width: '100%',
  maxWidth: '500px',
});

// Help icon stil
const StyledHelpIcon = styled(HelpOutlineIcon)({
  fontSize: '20px',
  color: 'rgba(0, 0, 0, 0.54)',
});

// Checkbox için özel stil
const StyledFormControlLabel = styled(FormControlLabel)({
  '& .MuiFormControlLabel-label': {
    fontSize: '1rem',
  },
});

const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({ onSubmit }) => {
  const { control, handleSubmit } = useForm();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  const handleFormSubmit = (data: any) => {
    console.log('Application Header form data:', data);
    onSubmit(data);
  };

  const handleAccordionChange = (path: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections(prev => ({
      ...prev,
      [path]: isExpanded
    }));
  };

  // Veri tipine göre uygun input bileşenini belirle
  const getInputComponent = (field: FormField, fieldType: FieldType | undefined) => {
    const baseType = fieldType?.restriction?.base || 'xs:string';
    
    // Enumeration varsa Select kullan
    if (fieldType?.restriction?.enumerations && fieldType.restriction.enumerations.length > 0) {
      const enumerations = fieldType.restriction.enumerations;
      return (
        <InputContainer>
          <Controller
            name={field.path}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <StyledFormControl fullWidth margin="normal" sx={{ alignItems: 'flex-start' }}>
                <InputLabel>{field.documentationName || field.tag}</InputLabel>
                <Select
                  value={value}
                  onChange={onChange}
                  label={field.documentationName || field.tag}
                >
                  {enumerations.map((enumItem, index) => (
                    <MenuItem key={index} value={enumItem.value}>
                      {enumItem.documentationName || enumItem.value}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
            )}
          />
          {field.documentationDefinition && (
            <Tooltip title={field.documentationDefinition} placement="right">
              <IconButton size="small">
                <StyledHelpIcon />
              </IconButton>
            </Tooltip>
          )}
        </InputContainer>
      );
    }
    
    // Boolean tipi için Checkbox
    if (baseType === 'xs:boolean') {
      return (
        <InputContainer>
          <Controller
            name={field.path}
            control={control}
            defaultValue={false}
            render={({ field: { onChange, value } }) => (
              <StyledFormControlLabel
                control={<Checkbox checked={value} onChange={onChange} />}
                label={field.documentationName || field.tag}
              />
            )}
          />
          {field.documentationDefinition && (
            <Tooltip title={field.documentationDefinition} placement="right">
              <IconButton size="small">
                <StyledHelpIcon />
              </IconButton>
            </Tooltip>
          )}
        </InputContainer>
      );
    }
    
    // Diğer türler için text input
    return (
      <InputContainer>
        <Controller
          name={field.path}
          control={control}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <StyledTextField
              fullWidth
              type={baseType.includes('decimal') || baseType.includes('integer') ? 'number' : 'text'}
              label={field.documentationName || field.tag}
              value={value}
              onChange={onChange}
              margin="normal"
            />
          )}
        />
        {field.documentationDefinition && (
          <Tooltip title={field.documentationDefinition} placement="right">
            <IconButton size="small">
              <StyledHelpIcon />
            </IconButton>
          </Tooltip>
        )}
      </InputContainer>
    );
  };

  // Alan için uygun bileşen oluştur
  const renderField = (field: FormField) => {
    const fieldType = typedHeaderTypes.find(t => t.name === field.xsdType);
    
    return (
      <LeftAlignedBox key={field.path}>
        {getInputComponent(field, fieldType)}
      </LeftAlignedBox>
    );
  };

  // Virtualized için düzleştirilmiş veri hazırla
  const flattenedData = useMemo(() => {
    const result: Array<{
      type: 'section' | 'field' | 'childField';
      field: FormField;
      parentPath?: string;
      level: number;
    }> = [];
    
    // Tüm level 0 alanları ekle
    const level0Fields = typedHeaderFields.filter(field => field.level === 0);
    
    const processField = (field: FormField, level: number) => {
      result.push({
        type: level === 0 ? 'section' : 'childField',
        field,
        level
      });
      
      // Alt alanları bul
      const children = typedHeaderFields.filter(f => f.parentPath === field.path);
      
      if (children.length > 0 && expandedSections[field.path] !== false) {
        children.forEach(child => {
          processField(child, level + 1);
        });
      }
    };
    
    level0Fields.forEach(field => {
      processField(field, 0);
    });
    
    return result;
  }, [expandedSections]);

  // Virtualized list için render fonksiyonu
  const renderItem = (index: number) => {
    const item = flattenedData[index];
    
    if (item.type === 'section') {
      return (
        <StyledAccordion 
          key={item.field.path} 
          expanded={expandedSections[item.field.path] !== false}
          onChange={handleAccordionChange(item.field.path)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{item.field.documentationName || item.field.tag}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LeftAlignedBox>
              {item.field.xsdType && renderField(item.field)}
            </LeftAlignedBox>
          </AccordionDetails>
        </StyledAccordion>
      );
    } else if (item.type === 'childField') {
      return (
        <Box key={item.field.path} sx={{ ml: item.level * 2, mt: 1, width: '100%' }}>
          {item.field.xsdType === null ? (
            <StyledAccordion 
              expanded={expandedSections[item.field.path] !== false}
              onChange={handleAccordionChange(item.field.path)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{item.field.documentationName || item.field.tag}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <LeftAlignedBox>
                  {item.field.documentationDefinition && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.field.documentationDefinition}
                    </Typography>
                  )}
                </LeftAlignedBox>
              </AccordionDetails>
            </StyledAccordion>
          ) : (
            renderField(item.field)
          )}
        </Box>
      );
    }
    
    return null;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Application Header
      </Typography>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ height: 'calc(100vh - 240px)', width: '100%' }}>
          <Virtuoso
            totalCount={flattenedData.length}
            itemContent={renderItem}
            style={{ height: '100%' }}
            overscan={200}
          />
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" color="primary">
            Save Header Data
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ApplicationHeader; 
