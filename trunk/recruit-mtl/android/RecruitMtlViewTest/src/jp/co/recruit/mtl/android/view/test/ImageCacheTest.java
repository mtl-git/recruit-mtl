package jp.co.recruit.mtl.android.view.test;


import java.lang.ref.SoftReference;
import java.util.Date;

import jp.co.recruit.mtl.android.view.ImageCacheManeger;
import jp.co.recruit.mtl.android.view.BitmapCache;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.test.AndroidTestCase;
import android.util.Log;

public class ImageCacheTest extends AndroidTestCase{
	private ImageCacheManeger im ;
	
	protected void setUp() throws Exception {
		super.setUp();
		im = ImageCacheManeger.imageCacheManeger(mContext);
		im.clearAllMemCache();
	}

	protected void tearDown() throws Exception {
		super.tearDown();
		im = null;
	}
	
	
	public void testMakeFileNameFromUrl(){
		assertEquals(mContext.getCacheDir().getAbsolutePath() + "/ImageCache/6b/7c/6b7c8bf4998ce5b8b6ba7c4b46eb4e7a",im.makeFileNameFromUrl("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg"));
	}
	
	public void testClearAllMemCache(){
		BitmapDrawable d = (BitmapDrawable) mContext.getResources().getDrawable(R.drawable.shop_thumbnail);
		im.saveToFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",d.getBitmap());
		assertEquals(1,im.getCacheSize());
		im.saveToFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_239.jpg",d.getBitmap());
		assertEquals(2,im.getCacheSize());	
		im.clearAllMemCache();
		
	}
	
	public void testSaveAndLoadFromFile(){	
		BitmapDrawable d = (BitmapDrawable) mContext.getResources().getDrawable(R.drawable.shop_thumbnail);
		im.saveToFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",d.getBitmap());
		
		Bitmap lb = im.loadFromFile("http://imgfp.hotp.jp/IMGH/59/79/P001065979/P001065979_238.jpg",-1).get();
		assertEquals(d.getBitmap().getHeight(),lb.getHeight());
		
		im.clearFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg");

		assertNull(im.loadFromFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",-1));	
	}
	
	public void testClearCacheFile(){	
		BitmapDrawable d = (BitmapDrawable) mContext.getResources().getDrawable(R.drawable.shop_thumbnail);
		im.saveToFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",d.getBitmap());
		im.saveToFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_237.jpg",d.getBitmap());
		Bitmap lb = im.loadFromFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",-1).get();
		assertEquals(d.getBitmap().getHeight(),lb.getHeight());
		Bitmap lb2 = im.loadFromFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_237.jpg",-1).get();
		assertEquals(d.getBitmap().getHeight(),lb2.getHeight());
		
		// 3600秒の指定では消えない
		im.clearCacheFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",3600);
		lb = im.loadFromFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",-1).get();
		assertNotNull(lb);	

		
		// １秒待って、1秒の指定では消える
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		im.clearCacheFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",1);
		SoftReference<Bitmap> lbr = im.loadFromFile("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",-1);
		assertNull(lbr);	

		
	}
	

	
	public void testSetAndGetImage(){
		BitmapDrawable d = (BitmapDrawable) mContext.getResources().getDrawable(R.drawable.shop_thumbnail);
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",d.getBitmap());
		
		Bitmap lb = im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",20).get();
		assertEquals(d.getBitmap().getHeight(),lb.getHeight());
		
		// １秒待って、1秒の指定では消える
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//有効期間が切れたので、レスポンスしない
		assertNull(im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",1));	
		
		//ファイル自体は消えていないので、必ず、キャッシュフィルを読み込むようにする（ -1 を指定）ともう一回読み出せる
		lb = im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg",-1).get();
		assertEquals(d.getBitmap().getHeight(),lb.getHeight());
		
	}
	
	
	/*
	 * メモリキャッシュの上限のテスト
	 */
	public void testMemoryCacheMax(){
		assertEquals(0,im.getCacheSize());
		
		//デフォルトの上限
		assertEquals(100,ImageCacheManeger.mMaxSize);
	
		
		//変更してみる
		ImageCacheManeger.mMaxSize = 4;
		assertEquals(4,ImageCacheManeger.mMaxSize);
		BitmapDrawable d = (BitmapDrawable) mContext.getResources().getDrawable(R.drawable.shop_thumbnail);
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg", d.getBitmap());
		assertEquals(1,im.getCacheSize());
		// 同じkeyだと増えない
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg", d.getBitmap());
		assertEquals(1,im.getCacheSize());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_239.jpg", d.getBitmap());
		assertEquals(2,im.getCacheSize());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_240.jpg", d.getBitmap());
		assertEquals(3,im.getCacheSize());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_241.jpg", d.getBitmap());
		assertEquals(4,im.getCacheSize());
		//上限に達すると増えない
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_242.jpg", d.getBitmap());
		assertEquals(4,im.getCacheSize());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_243.jpg", d.getBitmap());
		assertEquals(4,im.getCacheSize());
		
		//一旦メモりクリア
		im.clearAllMemCache();
		assertEquals(0,im.getCacheSize());
		//ファイルキャッシュを読み出すときもメモりキャッシュに投入される いろいろ、組み合わせてみる
		Log.d("TEST_START","----------");
		im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg", -1);
		assertEquals(1,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg", -1);
		assertEquals(1,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_239.jpg", -1);
		assertEquals(2,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_240.jpg", d.getBitmap());
		assertEquals(3,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_240.jpg", -1);
		assertEquals(3,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_241.jpg", d.getBitmap());
		assertEquals(4,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.getImage("http://irss.rdy.jp/IMGH/59/79/P001065979/P001065979_242.jpg", -1);
		assertEquals(4,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_243.jpg", d.getBitmap());
		assertEquals(4,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.setImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_244.jpg", d.getBitmap());
		assertEquals(4,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_242.jpg", -1);
		assertEquals(4,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		Log.d("TEST_MEM_CACHE_DUMP",im.getKeys().toString());
		
		//
		for (int i = 0 ; i < im.getKeys().size();i++){
			String key = im.getKeys().toArray()[i].toString();
			BitmapCache bc = im.getBitmapCache(key);
			Log.d("TEST_MEM_CACHE_DUMP",key + ":" + bc.lastAccessTime.toString());
		}
		//
		assertEquals("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_241.jpg",im.getMostOldItem());
		
		im.getImage("http://rss.rdy.jp/IMGH/59/79/P001065979/P001065979_238.jpg", -1);
		assertEquals(4,im.getCacheSize());
		Log.d("TEST_",(new Date()).toString());
		Log.d("TEST_END","----------");
		
		Log.d("TEST_MEM_CACHE_DUMP",im.getKeys().toString());
	}


}
