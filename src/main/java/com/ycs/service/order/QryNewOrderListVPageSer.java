package com.ycs.service.order;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.jfinal.plugin.activerecord.Page;
import com.ycs.dao.Address;
import com.ycs.dao.Order;
import com.ycs.dao.OrderOrder;
import com.ycs.dao.OrderOrderService;
import com.ycs.dao.OrderPay;
import com.ycs.dao.OrderPayDetail;
import com.ycs.dao.OrderService;
import com.ycs.dao.ServiceGoods;
import com.ycs.dao.Servicer;
import com.ycs.dao.User;
import com.ycs.def.OrderStatus;
import com.ycs.def.OrderType;
import com.ycs.def.UserStatus;
import com.ycs.service.IService;
import com.ycs.util.NumberUtil;
import com.ycs.util.StringUtil;
import com.ycs.util.def.StateCode;
import com.ycs.util.def.StateException;

public class QryNewOrderListVPageSer  implements IService {
	
	public Set<String> orderPayDetailPayTypes = null;
	public Double remainamount4MasterOrder = 0.0;
	public Double orderAmountDue = 0.0;

	@Override
	public Map doService(Map params) throws StateException {
		
		String userId =  StringUtil.trim(params.get("userId"));
		String pageNumberStr =  StringUtil.trim(params.get("pageNumber"));
		String pageSizeStr =  StringUtil.trim(params.get("pageSize"));
		String status =  StringUtil.trim(params.get("status"));
		String payStatus =  StringUtil.trim(params.get("payStatus"));
		String appraise =  StringUtil.trim(params.get("appraise"));
		String orderno = StringUtil.trim(params.get("orderno"));
		String isCyc = StringUtil.trim(params.get("isCyc"));
		
        User user = this.checkUser(userId);
        
        pageNumberStr = "".equals(pageNumberStr)?"1":pageNumberStr;
        pageSizeStr = "".equals(pageSizeStr)?"999999":pageSizeStr;
        
        int pageNumber = NumberUtil.toInt(pageNumberStr);
        int pageSize = NumberUtil.toInt(pageSizeStr);
        
		Page<OrderOrder> orderListPage =  null;
		
		if(!"".equals(orderno)){
			orderListPage = OrderOrder.dao.qryOrderOrderByOrderno(orderno);
		}else{
			orderListPage = OrderOrder.dao.qryNewOrderListVPage(userId, status, payStatus, appraise, isCyc, pageNumber, pageSize);
		}
		
		List<OrderOrder> orderListTemp = null;
		List<Map> orderList = new ArrayList<Map>();
		if(orderListPage!=null){
			orderListTemp = orderListPage.getList();
			if(orderListTemp!=null && orderListTemp.size()>0){
				for(OrderOrder order:orderListTemp){
					orderPayDetailPayTypes = new HashSet();
					remainamount4MasterOrder = 0.0;
					orderAmountDue = 0.0;
					String orderType = StringUtil.trim(order.get("ordertype"));
					Map orderInfosMap = new HashMap();
					String curOrderNo = StringUtil.trim(order.get("orderno"));
					orderInfosMap.put("orderno", curOrderNo);
					orderInfosMap.put("init", StringUtil.trim(order.get("init")));
					orderInfosMap.put("amount", StringUtil.trim(order.get("amount")));
					orderInfosMap.put("created", StringUtil.trim(order.get("created")));
					
					if(OrderType.FATHER_ORDER.equals(orderType)){
						
						List<OrderOrder> subOrderList = OrderOrder.dao.qrySubOrderByParentOrderNo(curOrderNo, userId, isCyc);
						List<Map> orderMapList = new ArrayList<Map>();
						
						for(OrderOrder subOrderOrder:subOrderList){
							Map orderMap = this.handleOrderOrderInfos(subOrderOrder,userId);
							orderMapList.add(orderMap);
						}
						orderInfosMap.put("list", orderMapList);
						
					}else{
						Map orderMap = this.handleOrderOrderInfos(order,userId);
						List<Map> orderMapList = new ArrayList<Map>();
						orderMapList.add(orderMap);
						orderInfosMap.put("list", orderMapList);
					}
					
					orderInfosMap.put("ordertype", orderType);
					
					if(orderPayDetailPayTypes.size()==0){
						orderInfosMap.put("paytype", "-1");
					}else if(orderPayDetailPayTypes.size()==1){
					    String paytype = StringUtil.trim(orderPayDetailPayTypes.toArray()[0]);
					    orderInfosMap.put("paytype", paytype);
					}else if(orderPayDetailPayTypes.size()>1){
						orderInfosMap.put("paytype", "-2");
					}
					
					//最后才初始化该字段
					orderInfosMap.put("remainamount", remainamount4MasterOrder.toString());
					orderInfosMap.put("amount",NumberUtil.format(orderAmountDue) );
					orderList.add(orderInfosMap);
				}
			}
		}

		Map re = new HashMap();
		re.put("orderList", orderList);
		re.put("pageNumber", orderListPage.getPageNumber());
		re.put("pageSize", orderListPage.getPageSize());
		re.put("totalPage", orderListPage.getTotalPage());
		re.put("totalRow", orderListPage.getTotalRow());
		
		return re;
	}
	
	
	public Map handleOrderOrderInfos(OrderOrder order,String userid){
		
		String created = StringUtil.trim(order.getStr("created"));
		String orderNo = StringUtil.trim(order.getStr("orderno"));
		String amount = StringUtil.trim(order.get("amount"));
		String payType = "";
		String orderType =  StringUtil.trim(order.get("ordertype"));
		String payStatusStr = StringUtil.trim(order.get("paystatus"));
		String statusStr =  StringUtil.trim(order.get("status"));
		String srname =   StringUtil.trim(order.getStr("srname"));
		String srtel =   StringUtil.trim(order.get("srtel"));
		String contactsname =   StringUtil.trim(order.getStr("contactsname"));
		String contactsaddress =   StringUtil.trim(order.getStr("contactsaddress"));
		String contactsmobile =   StringUtil.trim(order.get("contactsmobile"));
		String province =   StringUtil.trim(order.get("province"));
		String city =   StringUtil.trim(order.get("city"));
		String district =   StringUtil.trim(order.get("district"));
		String due = StringUtil.trim(order.get("due"));
		orderAmountDue = orderAmountDue + NumberUtil.toDouble(due);
		String saveamountall = StringUtil.trim(order.get("saveamountall")); 
		
		List orderServiceStatus20List = OrderService.dao.qryOrderServicesList8Orderno(
				userid, orderNo,"","");
		
		String isHaveHandleinOrderService = "0";
		if(orderServiceStatus20List!=null && orderServiceStatus20List.size()>0){
			isHaveHandleinOrderService = "1";
		}
		
//		Map param = new HashMap();
//		param.put("orderno", orderNo);
//		param.put("isCheck", "1");
//		
//		String isOrderHaveUnReview = "0";
//		
//		try{
//		QryUnReview8OrderNoSer qryUnReview8OrderNoSer = new QryUnReview8OrderNoSer();
//		Map myOrderIsHaveReview = qryUnReview8OrderNoSer.doService(param);
//		isOrderHaveUnReview = StringUtil.trim(myOrderIsHaveReview.get("isHaveUnReview"));
//		
//		}catch(Exception ex){
//			ex.printStackTrace();
//		}
		
		
		
		String serviceVersion = Address.dao.getAddressByCode(province, city, district);
		
		Map orderMap = new HashMap();
		orderMap.put("waitreviewcount", StringUtil.trim(order.get("waitreviewcount")));
		orderMap.put("userreviewtime", StringUtil.trim(order.get("userreviewtime")));
		orderMap.put("created", created);
		orderMap.put("orderno", orderNo);
		orderMap.put("amount", amount);
		orderMap.put("paytype", payType);
		orderMap.put("status", statusStr);
		orderMap.put("srname", srname);
		orderMap.put("srtel", srtel);
		orderMap.put("contactsname", contactsname);
		orderMap.put("contactsaddress", contactsaddress);
		orderMap.put("province", province);
		orderMap.put("city", city);
		orderMap.put("district", district);
		orderMap.put("contactsmobile", contactsmobile);
		orderMap.put("serviceVersion", serviceVersion);
		orderMap.put("due", NumberUtil.format(due));
		orderMap.put("saveamountall", saveamountall);
		
		orderMap.put("ordertype",StringUtil.trim(order.get("ordertype")));
//		orderMap.put("porderno",StringUtil.trim(order.get("porderno")));
//		orderMap.put("account",StringUtil.trim(order.get("account")));
//		orderMap.put("quantity",StringUtil.trim(order.get("quantity")));
		orderMap.put("init",StringUtil.trim(order.get("init")));
//		orderMap.put("amount",StringUtil.trim(order.get("amount")));
		orderMap.put("discount",StringUtil.trim(order.get("discount")));
		orderMap.put("confirmed",StringUtil.trim(order.get("confirmed")));
		orderMap.put("paid",StringUtil.trim(order.get("paid")));
		orderMap.put("received",StringUtil.trim(order.get("received")));
		orderMap.put("started",StringUtil.trim(order.get("started")));
		orderMap.put("finished",StringUtil.trim(order.get("finished")));
		orderMap.put("canceled",StringUtil.trim(order.get("canceled")));
		orderMap.put("cancelreason",StringUtil.trim(order.get("cancelreason")));
		orderMap.put("stoped",StringUtil.trim(order.get("stoped")));
		orderMap.put("stopreason",StringUtil.trim(order.get("stopreason")));
		orderMap.put("refund",StringUtil.trim(order.get("refund")));
		orderMap.put("refunded",StringUtil.trim(order.get("refunded")));
		orderMap.put("refundstatus",StringUtil.trim(order.get("refundstatus")));
		orderMap.put("disused",StringUtil.trim(order.get("disused")));
		orderMap.put("disusereason",StringUtil.trim(order.get("disusereason")));
		orderMap.put("osStarted","");
		orderMap.put("isHaveHandleinOrderService", isHaveHandleinOrderService);
		
		
		
		
		OrderService orderServiceFirstStarted = OrderService.dao.qryOrderServicesFirstStarted8Orderno(userid, orderNo);
		if(orderServiceFirstStarted!=null){
			orderMap.put("osStarted",StringUtil.trim(orderServiceFirstStarted.get("started")));
		}
		
		
		List serviceItemsList = new ArrayList();
		orderMap.put("serviceItemsList", serviceItemsList);
		
		List<OrderOrderService> orderOrdreServiceServiceItem = OrderOrderService.dao.qryOrderOrderServiceServiceItem4OrderList(orderNo);
		
		Map<String,List> servicesMap = new HashMap<String,List>();
		if(orderOrdreServiceServiceItem!=null && orderOrdreServiceServiceItem.size()>0){
			for(OrderOrderService orderOrderService:orderOrdreServiceServiceItem){
				
				List serviceMapItemsList = new ArrayList();
				
				String sdid = StringUtil.trim(orderOrderService.get("sdid"));
				String sdname = StringUtil.trim(orderOrderService.getStr("sdname"));
				String siname = StringUtil.trim(orderOrderService.getStr("siname"));
				String quantity = StringUtil.trim(orderOrderService.get("quantity"));
				String options = StringUtil.trim(orderOrderService.getStr("options"));
				
				ServiceGoods servicedetail = ServiceGoods.dao.findById(sdid);
				String serviceImgs = "";
				if(servicedetail!=null){
					serviceImgs = StringUtil.trim(servicedetail.get("pics"));
				}
				
				boolean isHave = servicesMap.containsKey(sdid);
				if(isHave == true){
					serviceMapItemsList = servicesMap.get(sdid);
				}else{
					servicesMap.put(sdid,serviceMapItemsList);
				}
				
				String price = StringUtil.trim(orderOrderService.get("price"));
				String savecoupons = StringUtil.trim(orderOrderService.get("savecoupons"));
				String savecomment = StringUtil.trim(orderOrderService.get("savecomment"));
				String saveamount = StringUtil.trim(orderOrderService.get("saveamount"));
				String oossid =  StringUtil.trim(orderOrderService.get("oossid"));
				
				options = ("||".equals(options))?"":options;
				String isHaveUnReview = "0";
				String userreviewed = StringUtil.trim(orderOrderService.get("userreviewed"));
				
				List<OrderService> orderservice = OrderService.dao.qryOrderServiceUnReview8OOSSID(oossid);
				if(orderservice!=null && orderservice.size()>0 ){
						isHaveUnReview = "1";
				}
				
				Map serviceItemMap = new HashMap();
				serviceItemMap.put("oossid", oossid);
				serviceItemMap.put("sdname", sdname);
				serviceItemMap.put("siname", siname);
				serviceItemMap.put("quantity", quantity);
				serviceItemMap.put("options", options);
				serviceItemMap.put("price", price);
				serviceItemMap.put("savecoupons", savecoupons);
				serviceItemMap.put("savecomment", savecomment);
				serviceItemMap.put("saveamount", saveamount);
				serviceItemMap.put("isHaveUnReview", isHaveUnReview);
				serviceItemMap.put("userreviewed", userreviewed);
				serviceItemMap.put("serviceImgs", serviceImgs);
				serviceItemMap.put("sdid", sdid);
				
				
				serviceItemMap.put("city", city);
				serviceItemMap.put("district", district);
				serviceItemMap.put("province", province);
				
				serviceMapItemsList.add(serviceItemMap);
				
				//serviceItemsList.add(serviceItemMap);
			}
			
			Iterator it = servicesMap.keySet().iterator();
			while(it.hasNext()){
				String sdid = StringUtil.trim(it.next());
				serviceItemsList.add(servicesMap.get(sdid));
			}
		}
		
		String srid = StringUtil.trim(order.get("srid"));
		Servicer servicer = Servicer.dao.findById(srid);
		String srcontacts = StringUtil.trim(servicer.getStr("contacts"));
		String srcontactstel = StringUtil.trim(servicer.getStr("contactstel"));
		String address = StringUtil.trim(servicer.getStr("address"));
		
		
		String srprovince =   StringUtil.trim(servicer.get("province"));
		String srcity =   StringUtil.trim(servicer.get("city"));
		String srdistrict =   StringUtil.trim(servicer.get("district"));
		
		
		String srpcdCN = "";
		if(!"".equals(srprovince)&&!"".equals(srcity)&&!"".equals(srdistrict)){
			srpcdCN = Address.dao.getAddressByCode(srprovince, srcity, srdistrict);
			address = address.replaceFirst(srpcdCN.replaceAll(" ", ""), "");
			address = "【"+srpcdCN+"】"+address;
		}
		
		
		
		servicer.put("adminname", "");

		orderMap.put("srcontacts", srcontacts);
		orderMap.put("srcontactstel", srcontactstel);
		orderMap.put("address", address);
		orderMap.put("srid", srid);
		
		
		
		//处理paystatus
		orderMap.put("paystatus", payStatusStr);
		
		//处理支付方式
		List<OrderPayDetail> orderPayDetailList = OrderPayDetail.dao.qryOrderPayDetailByOrderNo(orderNo);
		Double paidAmountDoubleSum = 0.0;
		Set myOrderPayDetailPayTypes = new HashSet();
		
		for(OrderPayDetail opd:orderPayDetailList){
			String opdPayDetail = StringUtil.trim(opd.get("paytype"));
			Double paidAmountDouble =  NumberUtil.toDouble(opd.get("paidamount"));
			paidAmountDoubleSum = paidAmountDouble + paidAmountDoubleSum;
			orderPayDetailPayTypes.add(opdPayDetail);
			myOrderPayDetailPayTypes.add(opdPayDetail);
		}
		if(myOrderPayDetailPayTypes.size()==0){
			orderMap.put("subOrderPaytype", "-1");
		}else if(myOrderPayDetailPayTypes.size()==1){
		    String paytype = StringUtil.trim(orderPayDetailPayTypes.toArray()[0]);
		    orderMap.put("subOrderPaytype", paytype);
		}else if(myOrderPayDetailPayTypes.size()>1){
			orderMap.put("subOrderPaytype", "-2");
		}
		
		String remainamountStr = "0";
		orderMap.put("remainamount", remainamountStr);
		// 处理 是否能够去支付
		OrderPay orderPay = OrderPay.dao.qryWaitOrderPay(orderNo);
		String orderPayId = "";
		if(orderPay!=null){
			orderPayId = StringUtil.trim(orderPay.get("id"));
			remainamountStr = StringUtil.trim(orderPay.get("remainamount"));
			if(NumberUtil.toLong(orderPayId)>0){
				orderMap.put("paystatus",OrderStatus.ORDER_PAY_STATUS_FOR_THE_PAYMENT);
			}
		}
		orderMap.put("orderpayid", orderPayId);
		orderMap.put("remainamount", NumberUtil.format(remainamountStr));
		orderMap.put("paidAmountSum", NumberUtil.format(paidAmountDoubleSum));
		
		remainamount4MasterOrder = remainamount4MasterOrder + NumberUtil.toDouble(remainamountStr);

		
		return orderMap;
	}
	
	public User checkUser(String userId) throws StateException{
		if("".equals(userId)){
			throw new StateException(StateCode.UNLOGIN);
		}
		
		User user = User.dao.findById(userId);
		
		if (user != null) {
			int userIdInt = user.getInt("id");
			if (userIdInt == 0) {
				throw new StateException(StateCode.USER_NOT_EXIST);
			}
		}

		if (user == null) {
			throw new StateException(StateCode.USER_NOT_EXIST);
		}
		
		String userstatus = StringUtil.trim(user.getInt("status"));
		//判断用户状态
		if(UserStatus.STATUS_DEL.equals(userstatus)){
			throw new StateException(StateCode.USER_DEL);
		}
		if(UserStatus.STATUS_LOCK.equals(userstatus)){
			throw new StateException(StateCode.USER_LOCK);
		}
		
		return user;
	}
	

}


