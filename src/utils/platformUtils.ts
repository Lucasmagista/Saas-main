const platformColorMap: Record<string, string> = {
  '#25D366': 'bg-whatsapp',
  '#0088cc': 'bg-telegram', 
  '#5865F2': 'bg-discord',
  '#E4405F': 'bg-instagram',
  '#1877F2': 'bg-facebook',
};

export const getPlatformColorClass = (color: string): string => {
  return platformColorMap[color] || 'bg-gray-500';
};

export const getPlatformIndicatorClass = (platformName: string): string => {
  const platform = platformName.toLowerCase();
  switch (platform) {
    case 'whatsapp':
      return 'platform-indicator-whatsapp';
    case 'telegram':
      return 'platform-indicator-telegram';
    case 'discord':
      return 'platform-indicator-discord';
    case 'instagram':
      return 'platform-indicator-instagram';
    case 'facebook':
      return 'platform-indicator-facebook';
    default:
      return 'platform-indicator-default';
  }
};

export const generateUniqueKey = (prefix: string, index: number, data?: { id?: string; name?: string }): string => {
  const timestamp = Date.now();
  const dataId = data?.id || data?.name || index;
  return `${prefix}-${dataId}-${timestamp}-${index}`;
};
