package jp.co.recruit.mtl.android.view.sample;

import jp.co.recruit.mtl.android.view.ImageCacheManeger;
import jp.co.recruit.mtl.android.view.R;
import jp.co.recruit.mtl.android.view.WebImageView;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;


public class RecruitMtlActivity extends Activity {

	WebImageView im = null;
	WebImageView im2 = null;
	
	/** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main );
        
        /*
         * メモリキャッシュの最大数。HashMapに保持しているので、そのEntryの最大数。超えたら、
         * 先に入れたのものから、消される。ただしファイルキャッシュには残っている.
         * このメモリキャッシュはグローバル
         */
        ImageCacheManeger.mMaxSize = 30 ; 
        
        
    	im = (WebImageView) this.findViewById(R.id.image);
    	im2 = (WebImageView) this.findViewById(R.id.image2);
   
        Button btn1 = (Button) findViewById(R.id.Button01);
        btn1.setOnClickListener(new OnClickListener(){
			public void onClick(View view) {
				updateView();
			}
        });
        
        Button btn2 = (Button) findViewById(R.id.Button02);
        btn2.setOnClickListener(new OnClickListener(){
			public void onClick(View view) {
				ImageCacheManeger icm = ImageCacheManeger.imageCacheManeger(RecruitMtlActivity.this);	
				icm.clearAllMemCache();	
				//ファイルを消すのは ImageCacheManeger.clearAllFile() みたいなのが、欲しいけど用意してないです。
				icm.clearFile("http://farm3.static.flickr.com/2628/4231572287_31d450b76a_o.jpg");
				icm.clearFile("http://farm3.static.flickr.com/file_not_found");
				
				im.setUri(null);
				im.downloadAndUpdateImage();
				
				im2.setUri(null);
				im2.downloadAndUpdateImage();
				
			}
        });
        



    }
    
    public void updateView(){
        
        im.defaultImageId = R.drawable.icon;
        im.expireSeconds = 3600; // 有効期間を秒で指定　デフォルトは24*3600
        im.setUri("http://farm3.static.flickr.com/2628/4231572287_31d450b76a_o.jpg");
        im.downloadAndUpdateImage();

        
        im2.defaultImageId = R.drawable.shop_thumbnail ; //画像が見つからないときのデフォルト画像を指定できる
        im2.setUri("http://farm3.static.flickr.com/file_not_found");
        im2.downloadAndUpdateImage(); 	
    	
    }
    
    
 
  
}
