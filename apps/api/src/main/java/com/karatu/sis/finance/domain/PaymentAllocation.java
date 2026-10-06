package com.karatu.sis.finance.domain;

import com.karatu.sis.tenant.domain.SchoolOwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_allocations")
public class PaymentAllocation extends SchoolOwnedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charge_id", nullable = false)
    private Charge charge;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    protected PaymentAllocation() {
    }

    public PaymentAllocation(Payment payment, Charge charge, BigDecimal amount) {
        this.payment = payment;
        this.charge = charge;
        this.amount = amount;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Charge getCharge() {
        return charge;
    }

    public void setCharge(Charge charge) {
        this.charge = charge;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
