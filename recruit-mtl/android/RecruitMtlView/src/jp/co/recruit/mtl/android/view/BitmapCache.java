package jp.co.recruit.mtl.android.view;

import java.lang.ref.SoftReference;
import java.util.Date;

import android.graphics.Bitmap;

public class BitmapCache {
	final public Date date;
	public Date lastAccessTime;
	final public SoftReference<Bitmap> bitmap;
	final public String url;
	
	public BitmapCache(String url,Date date, Bitmap bitmap) {
		super();
		this.url = url;
		this.lastAccessTime = new Date();
		this.date = date;
		this.bitmap = new SoftReference<Bitmap>(bitmap);
	}
	
	public Bitmap getBitmap(){
		return bitmap.get();
	}
	

}