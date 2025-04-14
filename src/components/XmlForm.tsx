import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Box, 
  TextField, 
  Typography, 
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  styled,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Container,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import messageFieldsData from '../data/messageFields.json';
import fieldTypesData from '../data/fieldTypes.json';
import { convertToXml } from '../utils/xmlConverter';

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

// JSON verilerini doğru tipe dönüştür
const typedMessageFields = messageFieldsData as unknown as FormField[];
const typedFieldTypes = fieldTypesData as unknown as FieldType[];

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

const XmlForm: React.FC = () => {
  const { control, handleSubmit } = useForm();
  const [xmlOutput, setXmlOutput] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const xml = convertToXml(data, messageFieldsData);
      setXmlOutput(xml);
      setShowAlert(true);
      setIsLoading(false);
    }, 100);
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
    
    // Sayısal tipler için number input
    if (baseType === 'xs:decimal' || baseType === 'xs:integer') {
      return (
        <InputContainer>
          <Controller
            name={field.path}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <StyledTextField
                fullWidth
                type="number"
                label={field.documentationName || field.tag}
                value={value}
                onChange={onChange}
                margin="normal"
                inputProps={{
                  min: fieldType?.restriction?.facets?.minInclusive || undefined,
                  step: baseType === 'xs:integer' ? 1 : 'any'
                }}
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
    
    // Tarih tipi için date input
    if (baseType === 'xs:date' || baseType === 'xs:dateTime') {
      return (
        <InputContainer>
          <Controller
            name={field.path}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <StyledTextField
                fullWidth
                type="datetime-local"
                label={field.documentationName || field.tag}
                value={value}
                onChange={onChange}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
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
    
    // Varsayılan olarak text input
    return (
      <InputContainer>
        <Controller
          name={field.path}
          control={control}
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <StyledTextField
              fullWidth
              label={field.documentationName || field.tag}
              value={value}
              onChange={onChange}
              margin="normal"
              inputProps={{
                maxLength: fieldType?.restriction?.facets?.maxLength || undefined,
                pattern: fieldType?.restriction?.facets?.pattern || undefined
              }}
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

  const renderField = (field: FormField) => {
    const fieldType = typedFieldTypes.find((type: FieldType) => type.name === field.xsdType);
    const isRequired = field.minOccurs === "1";
    
    return (
      <Box key={field.id} sx={{ mb: 2, width: '100%' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem', textAlign: 'left' }}>
          {field.documentationName || field.tag} (ID: {field.id})
          {isRequired && <span style={{ color: 'red' }}> *</span>}
        </Typography>
        <LeftAlignedBox>
          {getInputComponent(field, fieldType)}
        </LeftAlignedBox>
      </Box>
    );
  };

  // Performans için useMemo kullanarak alanları önceden işle
  const processedFields = useMemo(() => {
    // Tüm alanları ID'ye göre sırala (1'den 1899'a kadar)
    return [...typedMessageFields].sort((a, b) => a.id - b.id);
  }, []);

  // Level bilgisine göre alanları grupla
  const groupedFields = useMemo(() => {
    const result: { [key: number]: FormField[] } = {};
    
    processedFields.forEach((field: FormField) => {
      if (!result[field.level]) {
        result[field.level] = [];
      }
      result[field.level].push(field);
    });
    
    return result;
  }, [processedFields]);

  // Level 0'daki alanları render et
  const renderLevel0Fields = () => {
    if (!groupedFields[0]) return null;
    
    return groupedFields[0].map(field => {
      // xsdType null ise bu bir collapse başlığıdır
      if (field.xsdType === null) {
        const isRequired = field.minOccurs === "1";
        return (
          <StyledAccordion 
            key={field.id} 
            defaultExpanded={isRequired}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {field.documentationName || field.tag} (ID: {field.id})
                {isRequired && <span style={{ color: 'red' }}> *</span>}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <LeftAlignedBox>
                {renderChildFields(field.path)}
              </LeftAlignedBox>
              {field.documentationDefinition && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'left', fontSize: '0.875rem' }}>
                  {field.documentationDefinition}
                </Typography>
              )}
            </AccordionDetails>
          </StyledAccordion>
        );
      }
      // xsdType dolu ise bu bir veri giriş alanıdır
      return renderField(field);
    });
  };

  // Belirli bir parent path'e sahip alt alanları render et
  const renderChildFields = (parentPath: string) => {
    const childFields = processedFields.filter(
      (field: FormField) => field.parentPath === parentPath
    );
    
    return childFields.map(field => {
      // xsdType null ise bu bir collapse başlığıdır
      if (field.xsdType === null) {
        const isRequired = field.minOccurs === "1";
        return (
          <StyledAccordion 
            key={field.id} 
            defaultExpanded={isRequired}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                {field.documentationName || field.tag} (ID: {field.id})
                {isRequired && <span style={{ color: 'red' }}> *</span>}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <LeftAlignedBox>
                {renderChildFields(field.path)}
              </LeftAlignedBox>
              {field.documentationDefinition && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'left', fontSize: '0.875rem' }}>
                  {field.documentationDefinition}
                </Typography>
              )}
            </AccordionDetails>
          </StyledAccordion>
        );
      }
      // xsdType dolu ise bu bir veri giriş alanıdır
      return renderField(field);
    });
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ p: 0 }}>
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            XML Form
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Level 0'daki alanları göster */}
            <Box sx={{ width: '100%' }}>
              <LeftAlignedBox>
                {renderLevel0Fields()}
              </LeftAlignedBox>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Generate XML'}
            </Button>
          </form>
        </Paper>

        {xmlOutput && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generated XML
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={xmlOutput}
              InputProps={{
                readOnly: true,
              }}
            />
          </Paper>
        )}

        <Snackbar 
          open={showAlert} 
          autoHideDuration={6000} 
          onClose={() => setShowAlert(false)}
        >
          <Alert 
            onClose={() => setShowAlert(false)} 
            severity="success"
            sx={{ width: '100%' }}
          >
            XML generated successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default XmlForm; 