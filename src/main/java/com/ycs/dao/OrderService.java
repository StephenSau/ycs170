package com.ycs.dao;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.ycs.def.OrderServiceStatus;
import com.ycs.def.OrderStatus;
/**
 * 对应表:order_service
 * 订单服务表
 * @author fy
 *
 */
@SuppressWarnings("serial")
public class OrderService extends Model<OrderService> {
	public static final OrderService dao = new OrderService();
	private Log log = LogFactory.getLog(this.getClass());

	/**
	 * 根据订单ID，删除记录
	 * @param orderId
	 * @return
	 */
	public boolean deleteRecordByOrderId(String orderId){
		String sql = "DELETE FROM order_service WHERE orderid=?";
		dao.log.info("deleteRecordByOrderId: orderId-->" + orderId + "	|sql-->"
				+ sql);
		return Db.update(sql, orderId)>0;
	}
	
	/**
	 * 根据订单号,查询订单服务项
	 * @param orderNo
	 * @return
	 */
	public List<OrderService> qryOrderServiceByOrderNo(String orderNo){
		String sql = "SELECT a.id,a.serviceno,IFNULL(a.servername,'') servername,a.status,a.orderno,a.modified,a.siid as sidid,b.name AS itemname FROM order_service a,service_item b WHERE a.siid=b.id "
					+"AND a.orderid IN(SELECT a.id FROM order_order a WHERE (a.orderno=? OR a.porderno=?)) ORDER BY a.orderid ASC,a.id ASC";
		dao.log.info("qryOrderServiceByOrderNo: orderNo-->" + orderNo + "	|sql-->"
				+ sql);
		return dao.find(sql,orderNo,orderNo);
	}
	

	/**
	 * 取消订单按钮是否可用
	 * 需要满足以下条件，“取消订单”按钮才可用：该订单当前不存在“等待确认”的支付条目，且所有服务单状态均为“未启动”“待启动”“服务取消”中的任意一项。
	 * @param orderNo 订单号
	 * @return
	 */
	public boolean isCanCancelOrder(String orderId) {
		String sql = "SELECT COUNT(1) AS num FROM DUAL "
					+"WHERE "
					+"((SELECT COUNT(1) AS num FROM order_pay_detail a WHERE a.orderid=? AND a.status IN("+OrderStatus.ORDER_PAY_DETAIL_STATUS_CONFIRM_PAYMENT+","+OrderStatus.ORDER_PAY_DETAIL_STATUS_CONFIRM_PART_PAYMENT+"))=0) "
					+"AND "
					+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderid=? AND a.status NOT IN("+OrderStatus.ORDER_SERVICE_NOT_START+","+OrderStatus.ORDER_SERVICE_TO_START+","+OrderStatus.ORDER_SERVICE_HAS_BEEN_CANCELLED+"))=0)";
		log.info("isCanCancelOrder--> orderId->" + orderId + "|\n  sql ->" + sql);
		return dao.findFirst(sql,orderId,orderId).getLong("num")>new Long(0);
	}
	/**
	 *订单状态是否自动变为 已取消
	 * @param orderId 订单号
	 * @return
	 */
	public boolean isAutoCancelOrder(String orderId) {
		String sql = "SELECT COUNT(1) AS num FROM DUAL "
					+"WHERE "
					//+"((SELECT SUM(a.remainamount) FROM order_pay a WHERE a.orderid=? AND a.status IN("+OrderStatus.PAY_STATUS_FOR_THE_PAYMENT+","+OrderStatus.PAY_STATUS_IN_THE_PLAN+"))=0) "
					+"((SELECT count(1) as num FROM order_order a WHERE a.id=?  AND a.paystatus IN("+OrderStatus.ORDER_PAY_STATUS_HAS_BEEN_RECEIVING_FULL+"))=1) "
					+"AND "
					+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderid=? AND a.status NOT IN("+OrderStatus.ORDER_SERVICE_HAS_BEEN_CANCELLED+"))=0)";
		log.info("isAutoCancelOrder--> orderId->" + orderId + "|\n  sql ->" + sql);
		return dao.findFirst(sql,orderId,orderId).getLong("num")>new Long(0);
	}
	
	/**
	 *订单状态是否自动变为 已取消
	 * @param orderno 订单号
	 * @return
	 */
	public boolean isAutoCancelOrderForFullPay(String orderno) {
		String sql = "SELECT COUNT(1) AS num FROM DUAL "
				   + "WHERE ((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderno=? AND a.status NOT IN("
				   + OrderStatus.ORDER_SERVICE_HAS_BEEN_CANCELLED + "))=0)";
		log.info("isAutoCancelOrderForFullPay--> orderno->" + orderno + "|\n  sql ->" + sql);
		
		return dao.findFirst(sql, orderno).getLong("num") > new Long(0);
	}
	
	/**
	 *订单状态是否自动变为 已中止
	 * @param orderId 订单号
	 * @return
	 */
	public boolean isAutoStopOrder(String orderId) {
		String sql = "SELECT COUNT(1) AS num FROM DUAL "
					+"WHERE "
					//+"((SELECT SUM(a.remainamount) FROM order_pay a WHERE a.orderid=? AND a.status IN("+OrderStatus.PAY_STATUS_FOR_THE_PAYMENT+","+OrderStatus.PAY_STATUS_IN_THE_PLAN+"))=0) "
					+"((SELECT count(1) as num FROM order_order a WHERE a.id=?  AND a.paystatus IN("+OrderStatus.ORDER_PAY_STATUS_HAS_BEEN_RECEIVING_FULL+"))=1) "
					+"AND "
					+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderid=? AND a.status IN("+OrderStatus.ORDER_SERVICE_HAS_BEEN_SUSPENDED+"))>0) "
					+"AND "
					+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderid=? AND a.status NOT IN("+OrderStatus.ORDER_SERVICE_HAS_BEEN_CANCELLED+","+OrderStatus.ORDER_SERVICE_HAS_BEEN_SUSPENDED+"))=0)";
		log.info("isAutoStopOrder--> orderId->" + orderId + "|\n  sql ->" + sql);
		return dao.findFirst(sql,orderId,orderId,orderId).getLong("num")>new Long(0);
	}
	
	/**
	 *订单状态是否自动变为 已中止
	 * @param orderno 订单号
	 * @return
	 */
	public boolean isAutoStopOrderForFullPay(String orderno) {
		String sql = "SELECT COUNT(1) AS num FROM DUAL "
				+"WHERE "
				+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderno=? AND a.status IN("+OrderStatus.ORDER_SERVICE_HAS_BEEN_SUSPENDED+"))>0) "
				+"AND "
				+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderno=? AND a.status NOT IN("+OrderStatus.ORDER_SERVICE_HAS_BEEN_CANCELLED+","+OrderStatus.ORDER_SERVICE_HAS_BEEN_SUSPENDED+"))=0)";
		log.info("isAutoStopOrder--> orderno->" + orderno + "|\n  sql ->" + sql);
	
		return dao.findFirst(sql, orderno, orderno).getLong("num") > new Long(0);
	}
	
	/**
	 *订单状态是否自动变为 已完成
	 *已完成【自动】：当该订单的支付情况表符合“待收款=0、计划中=0”，且该订单下至少有一个服务单状态为“服务完成”，且所有服务单状态均为“服务完成”“服务中止”“服务取消”中的任意一项时，自动进入“已完成”
	 * @param orderId 订单号
	 * @return
	 */
	public boolean isAutoFinishOrder(String orderId) {
		String sql = "SELECT COUNT(1) AS num FROM DUAL "
					+"WHERE "
					//+"((SELECT SUM(a.remainamount) FROM order_pay a WHERE a.orderid=?  AND a.status IN("+OrderStatus.PAY_STATUS_FOR_THE_PAYMENT+","+OrderStatus.PAY_STATUS_IN_THE_PLAN+"))=0) "
					+"((SELECT count(1) as num FROM order_order a WHERE a.id=?  AND a.paystatus IN("+OrderStatus.ORDER_PAY_STATUS_HAS_BEEN_RECEIVING_FULL+"))=1) "
					+"AND "
					+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderid=? AND a.status IN("+OrderStatus.ORDER_SERVICE_HAS_BEEN_COMPLETED+"))>0) "
					+"AND "
					+"((SELECT COUNT(1) AS num FROM order_service a WHERE a.orderid=? AND a.status NOT IN("+OrderStatus.ORDER_SERVICE_HAS_BEEN_COMPLETED + "," + OrderStatus.ORDER_SERVICE_HAS_BEEN_CANCELLED+","+OrderStatus.ORDER_SERVICE_HAS_BEEN_SUSPENDED+"))=0)";
		log.info("isAutoFinishOrder--> orderId->" + orderId + "|\n  sql ->" + sql);
		return dao.findFirst(sql,orderId,orderId,orderId).getLong("num")>new Long(0);
	}
	
	/**
	 *订单状态是否自动变为 已完成
	 *订单下至少有一个服务单状态为“服务完成”，且所有服务单状态均为“服务完成”“服务中止”“服务取消”中的任意一项时，自动进入“已完成”
	 * @param orderId 订单号
	 * @return
	 */
	public boolean isAutoFinishOrderByOrderno(String orderno) {
		String sql = "SELECT COUNT(1) as num FROM DUAL "
				   + "WHERE (SELECT COUNT(1) FROM order_service a WHERE a.orderno=? AND a.status = " + OrderStatus.ORDER_SERVICE_HAS_BEEN_COMPLETED + ") > 0"
				   + " AND "
				   + "(SELECT COUNT(1) FROM order_service a WHERE a.orderno=? AND a.status NOT IN(" + OrderStatus.ORDER_SERVICE_HAS_BEEN_COMPLETED + "," + OrderStatus.ORDER_SERVICE_HAS_BEEN_CANCELLED + "," + OrderStatus.ORDER_SERVICE_HAS_BEEN_SUSPENDED + ")) = 0";
		log.info("isAutoFinishOrderByOrderno--> orderno->" + orderno + "|\n  sql ->" + sql);
		
		return dao.findFirst(sql, orderno, orderno).getLong("num") > new Long(0);
	}
	
	/**
	 * 获取订单的服务运行状态
	 * @param orderId 订单id
	 * @return
	 */
	public List<Record> getOrderServcStatus(String orderId){
		String sql = "SELECT" + 
					"  os.id, " + 
					"  os.orderid, " + 
					"  os.orderno, " + 
					"  os.oossid, " + 
					"  os.userid, " + 
					"  os.username, " + 
					"  os.siid, " + 
					"  os.siname, " + 
					"  os.status " + 
					" FROM order_service os " + 
					" WHERE os.orderid = ? ORDER BY os.orderid ASC , os.id ASC ";
		
		log.info("getOrderServcStatus     orderId->" + orderId + ", sql->" + sql);
		
		return Db.find(sql, orderId);
				
	}
	
	/**
	 * 服务是否有“取消”或“中止”
	 * @param orderno 订单号
	 * @return
	 */
	public Boolean getCancelOrPauseServices(String orderno){
		
		boolean retflag = false;
		
		String sql = "SELECT * FROM order_service WHERE orderno = ? AND status IN("
				+ OrderServiceStatus.STATUS_HAS_BEEN_CANCELLED
				+ ","
				+ OrderServiceStatus.STATUS_HAS_BEEN_SUSPENDED + ")";
		
		log.info("getCancelOrPauseServices     orderno->" + orderno + ", sql->" + sql);
		
		List<Record> services = Db.find(sql, orderno);
		
		if (services != null && services.size() > 0) {
			retflag = true;
		}
		
		return retflag;
		
	}

	/**
	 * ‘未启动’服务单设置为“待启动”
	 * @param orderno
	 */
	public Integer setOrderServicesStatus(String orderno) {
		
		String sql = "UPDATE order_service SET status = "
				+ OrderServiceStatus.STATUS_TO_START
				+ " WHERE orderno = ? AND status = "
				+ OrderServiceStatus.STATUS_NO_STARTED;
		
		log.info("setOrderServicesStatus     orderno->" + orderno + ", sql->" + sql);
		
		int num = Db.update(sql, orderno);
		
		return num;
	}
	
	public List<OrderService> qryOrderServiceByOrderOrderSiSig(
			String sisigid) {

		String sql = "	select * from order_service os where os.oossid = ?";

		List wheres = new ArrayList();
		wheres.add(sisigid);

		log.info("qryOrderServiceByOrderOrderSiSig:" + sql + "_wheres:"
				+ wheres);

		return this.find(sql, wheres.toArray());
	}
	
	public Page<OrderService> qryOrderServiceList8UserIdNStatus(String userId,String status,
			int pageNumber,int pageSize,String isreview,String confirmfinished){
		
		String select=" select os.confirmfinished,os.srid,os.id, os.siname, os.status, os.oossid, os.orderno, oo.id as orderid,ord.id as reviewid ";
		String from = "  from order_service os  left join  order_order oo ON oo.orderno = os.orderno "
				+ " left join order_review ord on ord.serviceid = os.id "
				+ " where os.userid=? ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		
		if(!"".equals(status)){
			from =from+" and  os.status=? ";
			wheres.add(status);
		}
		
		if("30".equals(status)){
			from =from+" and  os.confirmfinished is null ";
		}
		
		if("1".equals(confirmfinished)){
			from =from+" and os.confirmfinished is not null  and  ord.id is not null ";
		}
		
		
		if("1".equals(isreview)){
			from =from+" and  ord.id is null  and os.confirmfinished is not null ";
		}
		
		from = from+" order by os.id desc ";
		
		log.info("qryOrderServiceList8UserIdNStatus:"+select +" "+from+" "+wheres);
		
		return this.paginate(pageNumber, pageSize, select, from, wheres.toArray());
				
	}
	
	public List<OrderService> qryOrderServicesList8OOSSID(String userId,String oossid){
		
		String select=" select id,siname,status  from order_service os  where os.userid=? and os.oossid=? ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		wheres.add(oossid);
		
		select = select+" order by id desc ";
		
		log.info("qryOrderServicesList8OOSSID:"+select+";wheres:"+wheres);
		
		return this.find(select, wheres.toArray());
				
	}
	
	public List<OrderService> qryOrderServicesList8Orderno(String userId,String orderno,String serviceid,String oossid){
		
		String select=" select os.confirmfinished,ord.id as reviewid ,os.id,os.siname,os.status  from order_service os "
				+ " left join order_review ord on ord.serviceid = os.id "
				+ " where os.userid=? and os.orderno=? ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		wheres.add(orderno);
		
		
		
		if(!"".equals(serviceid)){
			select = select + " and os.id=? ";
			wheres.add(serviceid);
		}
		
		if(!"".equals(oossid)){
			select = select + " and os.oossid=? ";
			wheres.add(oossid);
		}
		
		select = select+" order by id desc ";
		
		log.info("qryOrderServicesList8Orderno:"+select+";wheres:"+wheres);
		
		return this.find(select, wheres.toArray());
				
	}
	
	public List<OrderService> qryOrderServicesListStatus208Orderno(String userId,String orderno,String serviceid,String oossid){
		
		String select=" select os.confirmfinished,ord.id as reviewid ,os.id,os.siname,os.status  from order_service os "
				+ " left join order_review ord on ord.serviceid = os.id "
				+ " where os.status=20 and os.userid=? and os.orderno=? ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		wheres.add(orderno);
		
		if(!"".equals(serviceid)){
			select = select + " and os.id=? ";
			wheres.add(serviceid);
		}
		
		if(!"".equals(oossid)){
			select = select + " and os.oossid=? ";
			wheres.add(oossid);
		}
		
		select = select+" order by id desc ";
		
		log.info("qryOrderServicesList8Orderno:"+select+";wheres:"+wheres);
		
		return this.find(select, wheres.toArray());
				
	}
	
	
	public OrderService qryOrderServicesFirstStarted8Orderno(String userId,String orderno){
		
		String select=" select id,siname,status,started  from order_service os  where os.userid=? and os.orderno=? and os.started is not null order by os.started asc ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		wheres.add(orderno);
		
		
		log.info("qryOrderServicesFirstStarted8Orderno:"+select+";wheres:"+wheres);
		
		return this.findFirst(select, wheres.toArray());
				
	}
	
	public OrderService qryServiceDetailIdNServicerIdByServiceId(String serviceId){
		String sql = " select os.orderno,ooss.sdid , ooss.srid from order_service os left join order_order_si_sig ooss on ooss.id = os.oossid  where os.id=? ";
		List wheres = new ArrayList();
		wheres.add(serviceId);
		
		log.info("qryServiceDetailIdNServicerIdByServiceId:"+sql+";wheres:"+wheres);
		
		return this.findFirst(sql, wheres.toArray());
	}
	
	public List<OrderService> qryOrderServiceUnReview8OOSSID(String oossId){
		
		//	`status`		TINYINT DEFAULT 0 COMMENT '服务状态：0-未启动；15-待启动；20-已启动处理中；30-已完成；40.申请中止；42-已取消；44-已中止；',
		
		String sql = " select os.orderid, os.id as osid,os.siname,ordr.sdname  from order_service os  "	
				+ " left join order_review ordr on ordr.serviceid = os.id where os.oossid = ?	and os.status=30 and ordr.id is null "
				+ " order by os.created ,ordr.sdname";
		List wheres = new ArrayList();
		wheres.add(oossId);
		
		log.info("qryOrderServiceUnReview8OOSSID:"+sql+";wheres:"+wheres);
		
		return this.find(sql, wheres.toArray());
	}
	
	public OrderService qryOrderServiceUnReview8OSID(String osid){
		
		//	`status`		TINYINT DEFAULT 0 COMMENT '服务状态：0-未启动；15-待启动；20-已启动处理中；30-已完成；40.申请中止；42-已取消；44-已中止；',
		
		String sql = " select os.oossid,ooss.sdid,os.orderid, os.id as osid,os.siname,ordr.sdname  from order_service os  "
				+ " left join order_review ordr on ordr.serviceid = os.id "
				+ " left join order_order_si_sig ooss on ooss.id = os.oossid "
				+ " where os.id = ?	and os.status=30 and ordr.id is null "
				+ " order by os.created ,ordr.sdname";
		List wheres = new ArrayList();
		wheres.add(osid);
		
		log.info("qryOrderServiceUnReview8OSID:"+sql+";wheres:"+wheres);
		
		return this.findFirst(sql, wheres.toArray());
	}
	
	
	
	
	public Page<OrderService> qryOrderServiceList8ReviewStatus(String userId,String isReview,
			int pageNumber,int pageSize){
		
		
		String select=" select os.*,sc.name as servicename ,sc.pics as serviceImgs ";
		String from = " FROM order_service os left join   order_order_si_sig  ooss on ooss.id = os.oossid "
				+ " left join   service_detail  sc on sc.id = ooss.sdid  "+
				 " where os.status=30 and os.userid=?  ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		
		if("1".equals(isReview)){
			from =from+" and os.userreviewed >? ";
			wheres.add(0);
		}else if("0".equals(isReview)){
			from =from+" and os.userreviewed =? ";
			wheres.add(0);
		}
		from = from+" order by id desc ";
		
		log.info("qryOrderServiceList8ReviewStatus:"+select+from+";wheres:"+wheres);
		
		return this.paginate(pageNumber, pageSize, select, from, wheres.toArray());
				
	}
	
	
	public OrderService qryOrderServiceWaitReview(String userId,String isReview){
		
		
		String select=" select count(os.id) as countno  ";
		String from = " FROM order_service os left join   order_order_si_sig  ooss on ooss.id = os.oossid "
				+ " left join   service_detail  sc on sc.id = ooss.sdid  "+
				 " where os.status=30 and os.userid=?  ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		
		if("1".equals(isReview)){
			from =from+" and os.userreviewed >? ";
			wheres.add(0);
		}else if("0".equals(isReview)){
			from =from+" and os.userreviewed =? ";
			wheres.add(0);
		}
		
		log.info("qryOrderServiceWaitReview:"+select+from+";wheres:"+wheres);
		
		return this.findFirst(select+from, wheres.toArray());
				
	}
	
	
	public OrderService qryOrderServiceHandleing(String userId){
		
		
		String select=" select count(os.id) as countno  ";
		String from = " FROM order_service os  "+
				 " where os.status=20 and os.userid=?  ";
	
		List wheres = new ArrayList();
		wheres.add(userId);
		
		
		log.info("qryOrderServiceHandleing:"+select+from+";wheres:"+wheres);
		
		return this.findFirst(select+from, wheres.toArray());
				
	}
	
}
