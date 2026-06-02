import * as React from 'react';
import {
  ActionGroup,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  Content,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  Radio,
  Stack,
  Title,
} from '@patternfly/react-core';
import {
  PatternFlyBrandTheme,
  PatternFlyColorScheme,
  PatternFlyContrastMode,
  PatternFlyIconSet,
  DEFAULT_PATTERNFLY_THEME_PREFERENCES,
} from '@app/theme/patternFlyTheme';
import { usePatternFlyTheme } from '@app/theme/PatternFlyThemeProvider';

const PatternFlyThemePreferencesPanel: React.FunctionComponent = () => {
  const { preferences, setPreferences, updatePreferences } = usePatternFlyTheme();

  const onBrandThemeChange = (event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (!checked) {
      return;
    }

    const value = (event.currentTarget as HTMLInputElement).value as PatternFlyBrandTheme;
    updatePreferences({
      brandTheme: value,
      iconSet: value === 'felt' ? 'rh-ui' : preferences.iconSet,
    });
  };

  const onColorSchemeChange = (event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (!checked) {
      return;
    }

    const value = (event.currentTarget as HTMLInputElement).value as PatternFlyColorScheme;
    updatePreferences({
      colorScheme: value,
      matchSystemColorScheme: false,
    });
  };

  const onContrastModeChange = (event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (!checked) {
      return;
    }

    const value = (event.currentTarget as HTMLInputElement).value as PatternFlyContrastMode;
    updatePreferences({ contrastMode: value });
  };

  const onIconSetChange = (event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    if (!checked) {
      return;
    }

    const value = (event.currentTarget as HTMLInputElement).value as PatternFlyIconSet;
    updatePreferences({ iconSet: value });
  };

  return (
    <Stack hasGutter>
      <Card isPlain>
        <CardTitle>
          <Title headingLevel="h2" size="md">
            Quick preview
          </Title>
        </CardTitle>
        <CardBody>
          <Content component="p">
            Apply a one-click PatternFly 6.5 preset, then fine-tune the options below.
          </Content>
          <ActionGroup>
            <Button variant="primary" onClick={() => setPreferences(DEFAULT_PATTERNFLY_THEME_PREFERENCES)}>
              Restore default (Felt + default contrast + RH icons)
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setPreferences({
                  brandTheme: 'default',
                  colorScheme: 'light',
                  contrastMode: 'default',
                  iconSet: 'patternfly',
                  matchSystemColorScheme: false,
                })
              }
            >
              Classic PatternFly
            </Button>
          </ActionGroup>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardTitle>
          <Title headingLevel="h2" size="md">
            Appearance
          </Title>
        </CardTitle>
        <CardBody>
          <Form>
            <FormSection title="Brand theme">
              <FormGroup fieldId="pf-brand-theme-default" role="radiogroup" label="Theme">
                <Radio
                  id="pf-brand-theme-default"
                  name="pf-brand-theme"
                  label="Default (PatternFly blue, square corners)"
                  isChecked={preferences.brandTheme === 'default'}
                  onChange={onBrandThemeChange}
                  value="default"
                />
                <Radio
                  id="pf-brand-theme-felt"
                  name="pf-brand-theme"
                  label="Project Felt (Red Hat red, pill shapes)"
                  isChecked={preferences.brandTheme === 'felt'}
                  onChange={onBrandThemeChange}
                  value="felt"
                />
              </FormGroup>
            </FormSection>

            <FormSection title="Color scheme">
              <FormGroup fieldId="pf-color-scheme-light" role="radiogroup" label="Color scheme">
                <Radio
                  id="pf-color-scheme-light"
                  name="pf-color-scheme"
                  label="Light"
                  isChecked={preferences.colorScheme === 'light' && !preferences.matchSystemColorScheme}
                  onChange={onColorSchemeChange}
                  value="light"
                />
                <Radio
                  id="pf-color-scheme-dark"
                  name="pf-color-scheme"
                  label="Dark"
                  isChecked={preferences.colorScheme === 'dark' && !preferences.matchSystemColorScheme}
                  onChange={onColorSchemeChange}
                  value="dark"
                />
              </FormGroup>
              <FormGroup fieldId="pf-match-system-color-scheme">
                <Checkbox
                  id="pf-match-system-color-scheme"
                  label="Match system light/dark preference"
                  isChecked={preferences.matchSystemColorScheme}
                  onChange={(_event, checked) => updatePreferences({ matchSystemColorScheme: checked })}
                />
              </FormGroup>
            </FormSection>

            <FormSection title="Contrast mode">
              <FormGroup fieldId="pf-contrast-default" role="radiogroup" label="Contrast">
                <Radio
                  id="pf-contrast-default"
                  name="pf-contrast-mode"
                  label="Default"
                  isChecked={preferences.contrastMode === 'default'}
                  onChange={onContrastModeChange}
                  value="default"
                />
                <Radio
                  id="pf-contrast-high"
                  name="pf-contrast-mode"
                  label="High contrast"
                  isChecked={preferences.contrastMode === 'high-contrast'}
                  onChange={onContrastModeChange}
                  value="high-contrast"
                />
                <Radio
                  id="pf-contrast-glass"
                  name="pf-contrast-mode"
                  label="Glass"
                  isChecked={preferences.contrastMode === 'glass'}
                  onChange={onContrastModeChange}
                  value="glass"
                />
                <FormHelperText>
                  High contrast and glass are mutually exclusive. Glass works best with Project Felt and includes the
                  branded background imagery shipped in PatternFly 6.5.
                </FormHelperText>
              </FormGroup>
            </FormSection>

            <FormSection title="Icon set">
              <FormGroup fieldId="pf-icon-set-patternfly" role="radiogroup" label="Icons">
                <Radio
                  id="pf-icon-set-patternfly"
                  name="pf-icon-set"
                  label="PatternFly icons"
                  isChecked={preferences.iconSet === 'patternfly'}
                  onChange={onIconSetChange}
                  value="patternfly"
                />
                <Radio
                  id="pf-icon-set-rh-ui"
                  name="pf-icon-set"
                  label="Red Hat UI icons (RHDS)"
                  isChecked={preferences.iconSet === 'rh-ui'}
                  onChange={onIconSetChange}
                  value="rh-ui"
                />
                <FormHelperText>
                  Red Hat UI icons swap in automatically for components that ship dual icon paths in PatternFly 6.5.
                </FormHelperText>
              </FormGroup>
            </FormSection>
          </Form>
        </CardBody>
      </Card>
    </Stack>
  );
};

export { PatternFlyThemePreferencesPanel };
