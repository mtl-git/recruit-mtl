package jp.co.recruit.mtl.android.view;


import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.lang.ref.SoftReference;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap; //スレッドセーフにする

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap.CompressFormat;

import android.util.Log;

/*	AsyncTaskでユーザビリティを向上させる参照
 *  http://labs.techfirm.co.jp/android/cho/1079#
 */
public class ImageCacheManeger {  
	public static ImageCacheManeger mImageCacheManeger = null;
    final private static ConcurrentHashMap<String,BitmapCache> mCache = new ConcurrentHashMap<String,BitmapCache>();
    public String mCacheDir;
	public static int mMaxSize = 100;
    
    public Set<String> getKeys(){
    	return mCache.keySet();	
    }
    public BitmapCache getBitmapCache(String key){
    	return mCache.get(key);
    }
    private ImageCacheManeger(Context context) {
		super();
		mCacheDir = context.getCacheDir().getAbsolutePath()+ "/ImageCache/";
	}
    
    public static ImageCacheManeger imageCacheManeger(Context context){
    	// メモリキャッシュは、アプリケーションでひとつだけ
    	if (mImageCacheManeger == null){
    		mImageCacheManeger = new ImageCacheManeger(context);
    		
    	}
		return mImageCacheManeger;
    }
    
    //ConcurrentHashMap sync
    public int getCacheSize() {
		return mCache.size();
	}  
    //ConcurrentHashMap sync
	public void clearAllMemCache() {
		mCache.clear();
	}

	public void setImage(String key, SoftReference<Bitmap> image) {  
    	saveToFile(key,image); 
    }  
	public void setImage(String key, Bitmap image) {  
    	saveToFile(key,new SoftReference<Bitmap>(image)); 
    }
	
	public SoftReference<Bitmap> getImage(String key,int seconds) {  
		SoftReference<Bitmap> bitmap = loadFromMemoryCache(key,seconds);
        if (bitmap == null){
        	bitmap =  loadFromFile(key, seconds);
        }else if (bitmap.get() == null){
        	bitmap =  loadFromFile(key, seconds);
        }
        return bitmap;
    }  
	
	//ConcurrentHashMap sync
    private SoftReference<Bitmap> loadFromMemoryCache(String key,int seconds){
    	SoftReference<Bitmap> bitmap = null;

    	BitmapCache bitmapCache =  mCache.get(key);  
    	if (bitmapCache != null){
        	if (((new Date()).getTime() - bitmapCache.date.getTime()) > seconds*1000 && seconds >= 0){
        		Log.d("IMAGE_CACHE", "EXPIRED_MEM:"+key+ bitmapCache.lastAccessTime.toString());
        		bitmap =  null;
			}else{
				bitmap = bitmapCache.bitmap;
				bitmapCache.lastAccessTime = new Date();
				Log.d("IMAGE_CACHE", "HIT_MEM:"+key  +String.valueOf(bitmapCache.lastAccessTime.getTime()));
			}
        }else{
        	Log.d("IMAGE_CACHE", "MISS_MEM:"+key);
        }
        return bitmap;
    }
    
	
	public String getMostOldItem(){
    	String cacheKey ;
    	
    	ArrayList<BitmapCache> entries = new ArrayList<BitmapCache>(mCache.values());
		Collections.sort(entries,new CacheLastAccessComparator());
		BitmapCache bc = entries.get(0);
		if (bc != null){
		Log.d("IMAGE_CACHE", "DELETE_MEM:"+bc.url+String.valueOf(bc.lastAccessTime.getTime()));
			cacheKey = entries.get(0).url;
		}else{
			cacheKey = null;
		}
    	return cacheKey;
    }
    
	//TODO sync
	private void saveToMemoryCache(String key, SoftReference<Bitmap> bit){
		Date savingDate = new Date();
		synchronized(this) {
			Log.d("IMAGE_CACHE", "COUNT_MEM:"+mCache.size());
	    	if (mCache.size() >= mMaxSize){
	    		String cacheKey = this.getMostOldItem();	
	    		mCache.remove(cacheKey);
	    	}
		}
		BitmapCache bc = new BitmapCache(key,savingDate,bit.get());
    	mCache.put(key,bc); 
		Log.d("IMAGE_CACHE", "SAVE_MEM:"+key+String.valueOf(bc.lastAccessTime.getTime()));	
	}
	
	//--------------------------------------------------------
	// 保存パスの取得処理
	public String makeFileNameFromUrl(String url){
		String res= null;
		try {
			MessageDigest md;
			md = MessageDigest.getInstance("MD5");
			md.update(url.getBytes());
			byte[] digest;
			digest = md.digest();
			java.math.BigInteger bi;
			bi = new java.math.BigInteger(digest);
			String s = bi.toString(16);  //参照　http://www.exampledepot.com/egs/java.math/Bytes2Str.html
			if (s.length() % 2 != 0) {
			    // Pad with 0
			    s = "0"+s;
			}
			res = mCacheDir + s.substring(0,2) + "/" + s.substring(2,4) + "/" + s;
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return res;
	}

	//TODO sync
	public SoftReference<Bitmap> loadFromFile(String key,int seconds) {
		String filename = makeFileNameFromUrl(key);
		
		try {
			File f = new File(filename);
			if (((new Date()).getTime() - f.lastModified()) > seconds*1000 && seconds >= 0){
				Log.d("IMAGE_CACHE", "EXPIRED_FILE:"+key);
				return null;
			}
			FileInputStream in = new FileInputStream(f);
			SoftReference<Bitmap> bit = new SoftReference<Bitmap>(BitmapFactory.decodeStream(in));
			saveToMemoryCache(key, bit);
			Log.d("IMAGE_CACHE", "HIT_FILE:"+key);
			return bit;
		} catch (Exception e) {
			//e.printStackTrace();
			Log.d("IMAGE_CACHE", "MISS_FILE:"+key);
			return null;
		}
	}
	
	//TODO sync
	public void saveToFile(String key,SoftReference<Bitmap> bit) { // 画像をファイルに書き込む
		String filename = makeFileNameFromUrl(key);
		saveToMemoryCache(key, bit);
		try {
			File f = new File(filename);
			f.getParentFile().mkdirs();
			BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(f));
			bit.get().compress(CompressFormat.PNG, 100, out);
			out.flush(); out.close();
			
		} catch(Exception e) {
			e.printStackTrace();
		}
	}
	public void saveToFile(String key,Bitmap bit) { // 画像をファイルに書き込む
		saveToFile(key,new SoftReference<Bitmap>(bit));
	}	
	

	//TODO sync
	public void clearFile(String key) {
		String filename = makeFileNameFromUrl(key);
		File f = new File(filename);
		f.delete();
	}
	
	//TODO sync
	public void clearCacheFile(String key, int seconds){
		String filename = makeFileNameFromUrl(key);
		File f = new File(filename);
		if (((new Date()).getTime() - f.lastModified()) >seconds*1000){
			f.delete();
		}
		
	}
} 

class CacheLastAccessComparator implements Comparator<Object>{
	public int compare(Object o1, Object o2){
		BitmapCache b1 = (BitmapCache)o1;
		BitmapCache b2 = (BitmapCache)o2;
		return ((BitmapCache)b1).lastAccessTime.compareTo(((BitmapCache)b2).lastAccessTime);
	}
}
