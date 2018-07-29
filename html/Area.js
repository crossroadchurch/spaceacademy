class Area {
    
      constructor(x, y, w, h, c, action) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.color = c;
        this.action = action;
      }
      
      show() {
        fill(this.color);
        noStroke();
        rect(this.x, this.y, this.width, this.height);
      }

      detectClick(mX, mY) {
        if(mX >= this.x && mX <= (this.x + this.width) &&
          mY >= this.y && mY <= (this.y + this.height)){
            if(this.action.indexOf('(') != -1){
              if(this.action.indexOf(')') == this.action.length -1){
                var params = this.action.slice(this.action.indexOf('(')+1, this.action.length-1);
                var fname = this.action.slice(0, this.action.indexOf('('));
                var fn = window[fname];
                if (params.indexOf(',') != -1){
                  var param1 = params.slice(0, params.indexOf(','));
                  var param2 = params.slice(params.indexOf(',')+1, params.length);
                  fn.call(null, param1, param2);
                } else {
                  fn.call(null, params);
                }
              }
            } else {
              var fn = window[this.action];
              fn();
            }
        }
      }
    }