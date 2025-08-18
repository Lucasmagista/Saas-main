// Repositório para acesso ao Supabase Storage
const supabase = require('../supabaseClient.cjs');

async function uploadToBucket(bucket, originalname, buffer) {
  const { data, error } = await supabase.storage.from(bucket).upload(originalname, buffer, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return data;
}

function getPublicUrl(bucket, originalname) {
  return supabase.storage.from(bucket).getPublicUrl(originalname).data.publicUrl;
}

module.exports = {
  uploadToBucket,
  getPublicUrl,
};
