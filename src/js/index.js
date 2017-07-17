
$(function () {
    var showGrade = document.querySelector('#showGrade');
    var data = [
        {'id': '10001', 'value': '2015'},
        {'id': '10002', 'value': '2016'},
        {'id': '10003', 'value': '2017'},
        {'id': '10004', 'value': '2018'},
        {'id': '10005', 'value': '已毕业'},
        {'id': '10006', 'value': '其他'}
    ];
    showGrade.addEventListener('click', function () {
        var gradeId = showGrade.dataset['id'];
        var gradeName = showGrade.dataset['value'];
        var gradeSelect = new IosSelect(1,
            [data],
            {
                title: '年级选择',
                oneLevelId: gradeId,
                itemHeight: 0.7,
                headerHeight: 0.88,
                cssUnit: 'rem',
                callback: function (selectOneObj) {
                    showGrade.value = selectOneObj.value;
                    showGrade.dataset['id'] = selectOneObj.id;
                    showGrade.dataset['value'] = selectOneObj.value;
                }
            });
    });
    //footer
    var address = [
        [
            {
                "集团总部": "北京市XXX",
                "咨询电话": "XXXXX"
            },
            {
                "国贸中心": "北京市朝阳区XXX",
                "咨询电话": "XX"
            }
        ],
        [
            {
                "上海总部": "上海市XXX",
                "咨询电话": "XXX"
            },
            {
                "咨询中心": "XXX",
                "咨询电话": "XXX"
            }
        ],
        [
            {
                "广州总部": "XXX",
                "咨询电话": "020-38499457"
            }
        ],
        [
            {
                "武汉总部": "XXX",
                "咨询电话": "XX"
            }
        ],
        [
            {
                "济南总部": "XX",
                "咨询电话": "0XX"
            }
        ], [
            {
                "深圳总部": "XX-1804室 518048",
                "咨询电话": "0755-XX "
            }
        ],
        [
            {
                "南京总部": "XX 210005",
                "咨询电话": "025-XX"
            }
        ],
        [
            {
                "成都总部": "XXXX",
                "咨询电话": "028-XX"
            }
        ], [
            {
                "杭州总部": "XX 310007",
                "咨询电话": "0571-XX"
            }
        ],
        [
            {
                "沈阳总部": "XX(XXX)",
                "咨询电话": "024-XXX"
            }
        ], [
            {
                "西安总部": "XX",
                "咨询电话": "029-XXX"
            }
        ], [
            {
                "西安总部": "XX",
                "咨询电话": "029-XX"
            }
        ], [
            {
                "长沙总部": "XXX 48003",
                "咨询电话": "XXXX"
            }
        ]
    ]
    var footerTabs = $('.footer-tabs span');
    var cityAddress=$('.city-address')[0];

    function renderAddress(index){
        var strHtml;
        cityAddress.innerHTML="";
        for(var m= 0,length=address[index].length;m<length;m++){
            var addObj=address[index][m];

          for(var key in addObj){

              strHtml="<p><i>"+key+":</i><span>"+addObj[key]+"</span></p>"
              cityAddress.innerHTML+=strHtml;
          }
        }
    }
    footerTabs.tap(function(event){
        _this = $(this);
        var current=_this.hasClass('selected');
        _this.addClass('selected').siblings('span').removeClass('selected');
        _this.parent().siblings().find('span').removeClass('selected')
        if(current){
            return false;
        }
        renderAddress(_this.data('id'))
        event.preventDefault();
    })
    //头部动画
    $('.menu-mask').on('tap',function(){
        $('.menu-mask').css({"left":"-99999px","opacity":"0",});
        $('.nav-menu').removeClass('nav-menu-animation')
    })
    $('.header-menu').on('tap',function(){
        $('.menu-mask').css({"left":"0","opacity":"0.5"});
        $('.nav-menu').addClass('nav-menu-animation')
    })
    $(".menu-mask,.nav-menu").on('touchmove',function(e){
        e.preventDefault();  //阻止默认行为
    })
})