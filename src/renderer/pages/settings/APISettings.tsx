import { ChangeEvent, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dropdown,
  Input,
  InputOnChangeData,
  Label,
  Option,
} from '@fluentui/react-components';
import { Premium16Regular } from '@fluentui/react-icons';
import MaskableInput from 'renderer/components/MaskableInput';
import useAuthStore from 'stores/useAuthStore';
import TooltipIcon from 'renderer/components/TooltipIcon';
import { IServiceProvider } from '../../../providers/types';
import ModelField from './ModelField';
import useSettingsStore from '../../../stores/useSettingsStore';
import ModelMappingButton from './ModelMappingButton';
import { getProviders, getProvider, getDefaultChatModel } from 'providers';

export default function APISettings() {
  const { t } = useTranslation();
  const api = useSettingsStore((state) => state.api);
  const session = useAuthStore((state) => state.session);
  const setAPI = useSettingsStore((state) => state.setAPI);
  const providers = useMemo(() => getProviders(), []);
  const [provider, setProvider] = useState<IServiceProvider>(
    Object.values(providers)[0],
  );

  useEffect(() => {
    const provider = getProvider(api.provider);
    setProvider(provider);
    onAPIProviderChange(null, { optionValue: provider.name });
  }, [api.provider, session]);

  const onAPIProviderChange = (ev: any, data: any) => {
    const $provider = getProvider(data.optionValue);
    const defaultModel = getDefaultChatModel(data.optionValue);
    const apiConfig = window.electron.store.get(
      `settings.api.providers.${data.optionValue}`,
      {
        provider: $provider.name,
        base: $provider.apiBase,
        model: defaultModel.name || '',
        key: '',
      },
    );

    if ($provider.isPremium) {
      apiConfig.key = '';
      apiConfig.base = $provider.apiBase;
    }
    if (
      Object.keys($provider.chat.models).length &&
      !$provider.chat.models[apiConfig.model]
    ) {
      apiConfig.model = defaultModel.name || '';
    }
    setAPI(apiConfig);
  };

  const onAPIBaseChange = (
    _: ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    setAPI({ base: data.value });
  };

  const onAPIKeyChange = (
    _: ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    setAPI({ key: data.value });
  };

  const onAPISecretChange = (
    ev: ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    setAPI({ secret: data.value });
  };

  const onDeploymentIdChange = (
    ev: ChangeEvent<HTMLInputElement>,
    data: InputOnChangeData,
  ) => {
    setAPI({ deploymentId: data.value });
  };

  return (
    <div className="settings-section">
      <div className="settings-section--header">{t('Common.API')}</div>
      <div className="py-5 flex-grow">
        <div>
          <Label htmlFor="provider" className="block mb-1.5">
            {t('Common.Provider')}
          </Label>
          <div>
            <Dropdown
              id="provider"
              className="w-[320px] latin"
              value={api.provider}
              selectedOptions={[api.provider]}
              onOptionSelect={onAPIProviderChange}
            >
              {Object.values(providers).map((provider: IServiceProvider) => (
                <Option key={provider.name} text={provider.name}>
                  <div className="flex justify-between w-full gap-2 latin">
                    {provider.name}
                    {provider.isPremium ? (
                      <div className="flex justify-start items-center gap-1 text-xs">
                        <Premium16Regular className="text-purple-600" />
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </Option>
              ))}
            </Dropdown>
          </div>
        </div>
        {provider.options.apiBaseCustomizable && (
          <div className="my-3.5 w-[400px]">
            <div className="flex justify-start items-center mb-1.5">
              <Label htmlFor="apiBase">{t('Common.APIBase')}</Label>
              <TooltipIcon tip={t(provider.chat.docs?.base || '')} />
            </div>
            <div>
              <Input
                id="apiBase"
                className="w-4/5 min-w-fit"
                disabled={!provider.options.apiBaseCustomizable}
                placeholder={
                  provider.chat.placeholders?.base || provider.apiBase
                }
                value={api.base}
                onChange={onAPIBaseChange}
              />
            </div>
          </div>
        )}
        {provider.options.apiKeyCustomizable && (
          <div className="my-3.5">
            <div className="flex justify-start items-center mb-1.5">
              <Label htmlFor="apiKey" className="block">
                {t('Common.APIKey')}
              </Label>
              <TooltipIcon tip={t(provider.chat.docs?.key || '')} />
            </div>
            <div>
              <MaskableInput
                id="apiKey"
                className="w-4/5 min-w-fit"
                value={api.key}
                disabled={!provider.options.apiKeyCustomizable}
                onChange={onAPIKeyChange}
              />
            </div>
          </div>
        )}
        {['Azure', 'Doubao'].includes(provider.name) ? (
          <div className="my-3.5">
            <div className="flex justify-start items-center mb-1.5">
              <Label htmlFor="deploymentId">
                {t(`${provider.name}.DeploymentID`)}
              </Label>
              <TooltipIcon tip={t(provider.chat.docs?.deploymentId || '')} />
            </div>
            <Input
              value={api.deploymentId || ''}
              placeholder={t(provider.chat.placeholders?.deploymentId || '')}
              onChange={onDeploymentIdChange}
              className="w-4/5 min-w-fit"
            />
          </div>
        ) : null}
        {provider.name === 'Baidu' ? (
          <div className="my-3.5">
            <div className="flex justify-start items-center mb-1.5">
              <Label htmlFor="apiSecret">{t('Common.SecretKey')}</Label>
              <TooltipIcon tip={t(provider.chat.docs?.key || '')} />
            </div>
            <MaskableInput
              id="apiSecret"
              className="w-4/5 min-w-fit"
              placeholder={t(provider.chat.placeholders?.secret || '')}
              value={api.secret}
              onChange={onAPISecretChange}
            />
          </div>
        ) : null}
        <ModelField />
        {provider.description && (
          <div className="tips">{provider.description}</div>
        )}
        <ModelMappingButton />
      </div>
    </div>
  );
}
