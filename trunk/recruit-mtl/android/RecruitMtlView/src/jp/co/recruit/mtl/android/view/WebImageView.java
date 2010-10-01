package jp.co.recruit.mtl.android.view;



import java.io.InputStream;
import java.lang.ref.SoftReference;
import java.net.URI;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import android.content.Context;
import android.content.res.Resources.NotFoundException;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.ProgressBar;

public class WebImageView extends FrameLayout{
	private DownloadTask task = null;
	private String uri= null;
	public int defaultImageId = 0;
	public ImageView mImageView = null;
	public ProgressBar mProgressBar = null;
	public int expireSeconds= 3600*24;
	
	public String getUri() {
		return uri;
	}
	
	public void setUri(String uri) {
		this.uri = uri;
	}

	public void init(Context context){
		
		mProgressBar = new ProgressBar(context);
		mProgressBar.setVisibility(INVISIBLE);
		LayoutParams params = new LayoutParams(LayoutParams.WRAP_CONTENT,LayoutParams.WRAP_CONTENT);
		params.gravity = Gravity.CENTER;
		mProgressBar.setLayoutParams(params);
		
		
		LayoutParams params_i = new LayoutParams(LayoutParams.FILL_PARENT,LayoutParams.FILL_PARENT);
		mImageView.setLayoutParams(params_i);
		
		this.addView(mImageView);
		this.addView(mProgressBar);
	}
	
	public WebImageView(Context context) {
		super(context);
		mImageView = new ImageView(context);
		init(context);
	}
	
	public WebImageView(Context context, AttributeSet attrs) {
		super(context,attrs);
		mImageView = new ImageView(context,attrs);
		init(context);
	}
	
	public WebImageView(Context context, AttributeSet attrs, int defStyle){
		super(context,attrs,defStyle);
		mImageView = new ImageView(context,attrs,defStyle);
		init(context);
	}

	public void setDefaultImage(){
		if (defaultImageId == 0){
			mImageView.setImageBitmap(null);
		}else{
			try{
				mImageView.setImageDrawable(getResources().getDrawable(defaultImageId));
			}catch (NotFoundException e){
				mImageView.setImageBitmap(null);
			}
		}
	}
	
	// 画像をダウンロードして表示する
    public void downloadAndUpdateImage() {
        clearImage();// 画像を削除
           
        String uri = getUri();// URI文字列の取得
        if (uri != null){
        	//更新中プログレス開始
            mProgressBar.setVisibility(View.VISIBLE);
            
        	task = new DownloadTask(getContext(),this);
        	task.setmExpireSeconds(expireSeconds);
        	// ダウンロードを開始
        	task.execute(uri);
        }else{
        	setDefaultImage();
        }
    }
 
    // UIのImageを設定する
    void setResultImage(SoftReference<Bitmap> result) {
    	if (result == null){
    		setDefaultImage();
    	}else if (result.get() == null){
    		setDefaultImage();
    	}else{
    		mImageView.setImageBitmap(result.get());
    	}
    	task = null;
    	
    	//更新中プログレス停止
    	mProgressBar.setVisibility(View.INVISIBLE);
    }
    
    // 画像表示を削除する
    private void clearImage() {
    	mImageView.setImageBitmap(null);
    	if (task != null){
    		// ダウンロード中のタスクがあったら、一旦削除
    		task.cancel(true);
    		//タスクは使い回せないので、いったん、破棄
    		task = null;
    	}
    }

	public void setImageBitmap(Bitmap bitmap) {
		mImageView.setImageBitmap(bitmap);
	}
}

class DownloadTask extends AsyncTask<String, Integer, SoftReference<Bitmap>> {
    private HttpClient mClient;
    private HttpGet mGetMethod;
    private WebImageView mWebImageView;
    private int mExpireSeconds= 3600*24;
    private ImageCacheManeger mImageCacheManeger = null;
    
    public int getmExpireSeconds() {
		return mExpireSeconds;
	}
	public void setmExpireSeconds(int mExpireSeconds) {
		this.mExpireSeconds = mExpireSeconds;
	}
	public DownloadTask(Context context,WebImageView webImageView) {
    	mWebImageView = webImageView;
        mClient = new DefaultHttpClient();
        mGetMethod = new HttpGet();
        mImageCacheManeger = ImageCacheManeger.imageCacheManeger(context.getApplicationContext());
    }
	
    // キャッシュ化　オフラインでも見れるように
	SoftReference<Bitmap> downloadImage(String uri) {
    	SoftReference<Bitmap> image = mImageCacheManeger.getImage(uri,mExpireSeconds);  
    	if (image != null){
    		//Log.d("IMAGE_CACHE", "HIT:"+uri);
    		return image;
    	}else{
    		//Log.d("IMAGE_CACHE", "MISS:"+uri);
	        try {
	            mGetMethod.setURI(new URI(uri));
	            Log.d("IMAGE_CACHE", "GET:"+uri);
	            HttpResponse resp = mClient.execute(mGetMethod);
	            if (resp.getStatusLine().getStatusCode() < 400) {
	            	//Log.d("IMAGE_CACHE", "MAKE_BITMAP:"+uri);
	                InputStream is = resp.getEntity().getContent();
	                SoftReference<Bitmap> bit = new SoftReference<Bitmap>(createBitmap(is));
	                is.close();
	                //Log.d("IMAGE_CACHE", "SAVE:"+uri);
	                mImageCacheManeger.setImage(uri, bit); 
	                return bit;
	            }
	        } catch (Exception e) {
	            e.printStackTrace();
	        }
    	}
        return mImageCacheManeger.getImage(uri,-1);
    }

    private Bitmap createBitmap(InputStream is) {
        return BitmapFactory.decodeStream(is);
    }

    //バックグラウンドで画像をダウンロードする
    @Override
    protected SoftReference<Bitmap> doInBackground(String... params) {
        String uri = params[0];
        return downloadImage(uri);
    }

    //画像を描画
    @Override
    protected void onPostExecute(SoftReference<Bitmap> result) {
    	mWebImageView.setResultImage(result);
    }
}



